import { App } from "~/core/helpers";
import { parseGpx } from "~/lib/gpx";
import { numericId } from "~/lib/id";
import { MapSource } from "~/map/sources";

export const imports = ({ get }: App) => ({
  importGpx: (file: File) => {
    const { map, history, routes } = get();

    const reader = new FileReader();

    reader.onload = (file) => {
      const xml = file.target?.result as string;
      if (!xml) {
        return;
      }

      const points = parseGpx(xml);

      history.push({
        name: "importGpx",
        route: {
          type: "Route",
          id: numericId(),
          source: MapSource.Routes,
          closed: false,
          smartMatching: { enabled: false, profile: null },
          transientPoints: [],
          rawPoints: [],
          points,
          style: routes.style,
        },
      });

      map.move(points[0], 6, 0, 0);
    };

    reader.readAsText(file);
  },
});
