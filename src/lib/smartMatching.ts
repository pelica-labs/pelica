import { MapboxProfile } from "@mapbox/mapbox-sdk/lib/classes/mapi-request";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import polyline from "@mapbox/polyline";
import { Position } from "@turf/turf";
import CheapRuler from "cheap-ruler";
import { chunk } from "lodash";

import { mapboxDirections, mapboxMapMatching } from "~/lib/mapbox";

export type SmartMatching = {
  enabled: boolean;
  profile: SmartMatchingProfile | null;
};

export type SmartMatchingProfile = MapboxProfile;

export const mapMatch = async (points: Position[], profile: SmartMatchingProfile): Promise<Position[]> => {
  const chunks = await Promise.all(
    chunk(points, 100).map(async (points) => {
      if (points.length < 2) {
        return points;
      }

      const res = await mapboxMapMatching
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .getMatch({
          profile,
          points: points.map((point) => {
            return {
              coordinates: point as [number, number],
              radius: 50,
            };
          }),
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
    })
  );

  return chunks.flat();
};

export const directionsMatch = async (points: Position[], profile: SmartMatchingProfile): Promise<Position[]> => {
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
              coordinates: point,
            };
          }),
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
};

export const smartMatch = async (points: Position[], profile: SmartMatchingProfile): Promise<Position[]> => {
  if (points.length < 2) return points;

  const chunks = await Promise.all(
    chunkByDistance(points).map(({ points, method }: { points: Position[]; method: "mapMatch" | "directions" }) => {
      if (true /*method === "mapMatch" */) {
        return mapMatch(points, profile);
      } else {
        // method === 'directions'
        return directionsMatch(points, profile);
      }
    })
  );

  return chunks.flat();
};

/**
 * Returns an array of points chunked by distance between points.
 * Points within 100m of each other will be chunked in the same group.
 */
const chunkByDistance = (points: Position[]): Array<{ points: Position[]; method: "mapMatch" | "directions" }> => {
  if (points.length < 2) return [{ points, method: "directions" }];

  const ruler = new CheapRuler(points[0][1], "meters");
  const minDistance = 500; // meters

  const comparison = (a: Position, b: Position) =>
    ruler.distance(a as [number, number], b as [number, number]) < minDistance;

  const chunks: Array<{ points: Position[]; method: "mapMatch" | "directions" }> = [];
  let currentChunk: Position[] = [];
  let lastDistanceRespected = comparison(points[0], points[1]);

  for (let i = 0; i < points.length - 1; i++) {
    const isDistanceRespected = comparison(points[i], points[i + 1]);
    if (isDistanceRespected === lastDistanceRespected) {
      currentChunk.push(points[i]);
    } else {
      chunks.push({ points: [...currentChunk, points[i]], method: isDistanceRespected ? "mapMatch" : "directions" });
      currentChunk = [points[i]];
      lastDistanceRespected = isDistanceRespected;
    }
  }

  // add last bit
  currentChunk.push(points[points.length - 1]);
  chunks.push({ points: currentChunk, method: lastDistanceRespected ? "mapMatch" : "directions" });

  return chunks;
};
