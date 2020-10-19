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
  // @todo depending on distance between points, use mapMatch or directions match.
  // if (points.length === 0) return [];
  // const ruler = new CheapRuler(points[0][1], "meters");
  return mapMatch(points, profile);
};
