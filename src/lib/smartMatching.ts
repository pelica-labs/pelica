import { MapboxProfile } from "@mapbox/mapbox-sdk/lib/classes/mapi-request";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import { Position } from "@turf/turf";
import { chunk } from "lodash";

import { mapboxMapMatching } from "~/lib/mapbox";

export type SmartMatching = {
  enabled: boolean;
  profile: SmartMatchingProfile | null;
};

export type SmartMatchingProfile = MapboxProfile;

export const smartMatch = async (points: Position[], profile: SmartMatchingProfile): Promise<Position[]> => {
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
        console.info("Smart matching did return any tracepoints", res.body);

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
