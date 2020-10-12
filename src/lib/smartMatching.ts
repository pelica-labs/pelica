import { MapboxProfile } from "@mapbox/mapbox-sdk/lib/classes/mapi-request";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import { chunk } from "lodash";

import { Coordinates, PolyLine } from "~/core/geometries";
import { mapboxMapMatching } from "~/lib/mapbox";

export type SmartMatching = {
  enabled: boolean;
  profile: SmartMatchingProfile | null;
};

export type SmartMatchingProfile = MapboxProfile;

export const smartMatch = async (line: PolyLine, profile: SmartMatchingProfile): Promise<Coordinates[]> => {
  const chunks = await Promise.all(
    chunk(line.points, 100).map(async (points) => {
      if (points.length < 2) {
        return points;
      }

      const res = await mapboxMapMatching
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .getMatch({
          tidy: true,
          profile,
          points: points.map((point) => {
            return {
              coordinates: [point.longitude, point.latitude],
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
        .filter((tracepoint) => tracepoint !== null)
        .map((tracepoint) => {
          return {
            longitude: tracepoint.location[0],
            latitude: tracepoint.location[1],
          };
        });
    })
  );

  return chunks.flat();
};
