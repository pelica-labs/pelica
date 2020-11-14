import { MapboxProfile } from "@mapbox/mapbox-sdk/lib/classes/mapi-request";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import polyline from "@mapbox/polyline";
import { Position } from "@turf/turf";
import CheapRuler from "cheap-ruler";
import { chunk } from "lodash";

import { DrawingMode } from "~/core/routes";
import { mapboxDirections, mapboxMapMatching } from "~/lib/mapbox";

export type SmartMatching = {
  enabled: boolean;
  profile: SmartMatchingProfile | null;
};

export type SmartMatchingProfile = MapboxProfile;

type SmartMatchingSegment = {
  points: Position[];
  method: "mapMatch" | "directions";
};

export const smartMatch = async (
  points: Position[],
  profile: SmartMatchingProfile,
  drawingMode?: DrawingMode
): Promise<Position[]> => {
  if (points.length < 2) {
    return points;
  }

  if (drawingMode === "pointByPoint") {
    return directionsMatch(points, profile);
  } else if (drawingMode === "freeDrawing") {
    return mapMatch(points, profile);
  } else {
    // chunk by distance and apply directions or mapmatch based on distance.
    const chunks = await Promise.all(
      chunkByDistance(points).map((segment) => {
        if (segment.method === "mapMatch") {
          return mapMatch(segment.points, profile);
        }

        if (segment.method === "directions") {
          return directionsMatch(segment.points, profile);
        }

        return [];
      })
    );

    return chunks.flat();
  }
};

const mapMatch = async (points: Position[], profile: SmartMatchingProfile): Promise<Position[]> => {
  const chunks = await Promise.all(
    chunk(points, 100).map(async (points) => {
      if (points.length < 2) {
        return points;
      }

      try {
        const res = await mapboxMapMatching
          .getMatch({
            profile,
            points: points.map((point) => {
              return {
                coordinates: point.map((c) => +c.toFixed(6)) as [number, number],
                radius: 50,
              };
            }),
            overview: "full",
          })
          .send();

        if (!res.body.tracepoints) {
          console.info("Map matching did return any tracepoints", res.body);

          return points;
        }

        return (res.body.tracepoints as Tracepoint[])
          .filter((tracepoint) => {
            return tracepoint !== null;
          })
          .map((tracepoint) => {
            return tracepoint.location;
          });
      } catch (error) {
        console.info("There was an error mapmatching the request.", error);
        return points;
      }
    })
  );

  return chunks.flat();
};

const directionsMatch = async (points: Position[], profile: SmartMatchingProfile): Promise<Position[]> => {
  try {
    const chunks = await Promise.all(
      chunk(points, 25).map(async (points) => {
        if (points.length < 2) {
          return points;
        }

        const res = await mapboxDirections
          .getDirections({
            profile,
            waypoints: points.map((point) => {
              return {
                coordinates: point.map((c) => +c.toFixed(6)),
              };
            }),
            overview: "full",
          })
          .send();

        if (!res.body.routes?.length || !res.body.routes[0].geometry) {
          console.info("Directions matching did return any routes", res.body);

          return points;
        }

        return polyline.toGeoJSON(res.body.routes[0].geometry as string).coordinates;
      })
    );

    return chunks.flat();
  } catch (error) {
    console.info("There was an error with the directions request.", error);
    return points;
  }
};

/**
 * Returns an array of points chunked by distance between points.
 * Points within 100m of each other will be chunked in the same group.
 */
export const chunkByDistance = (points: Position[]): SmartMatchingSegment[] => {
  if (points.length < 3) {
    return [{ points, method: "directions" }];
  }

  const ruler = new CheapRuler(points[0][1], "meters");
  const minDistance = 400; // meters

  const comparison = (a: Position, b: Position) => {
    return ruler.distance(a as [number, number], b as [number, number]) < minDistance;
  };

  const chunks: SmartMatchingSegment[] = [];
  let currentChunk: Position[] = [];
  let lastDistanceRespected = comparison(points[0], points[1]);

  for (let i = 0; i < points.length - 1; i++) {
    const isDistanceRespected = comparison(points[i], points[i + 1]);
    if (isDistanceRespected === lastDistanceRespected) {
      currentChunk.push(points[i]);
    } else {
      chunks.push({
        points: [...currentChunk, points[i]],
        method: isDistanceRespected ? "mapMatch" : "directions",
      });
      currentChunk = [points[i]];
      lastDistanceRespected = isDistanceRespected;
    }
  }

  // add last bit
  currentChunk.push(points[points.length - 1]);
  chunks.push({
    points: currentChunk,
    method: lastDistanceRespected ? "mapMatch" : "directions",
  });

  return chunks;
};
