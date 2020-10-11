import { nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { parseGpx } from "~/lib/gpx";
import { MapSource } from "~/lib/sources";

export const imports = ({ get }: App) => ({
  importGpx: (file: File) => {
    const { mapView, history, line } = get();

    const reader = new FileReader();

    reader.onload = (file) => {
      const xml = file.target?.result as string;
      if (!xml) {
        return;
      }

      const points = parseGpx(xml);

      history.push({
        name: "importGpx",
        line: {
          type: "PolyLine",
          id: nextGeometryId(),
          source: MapSource.Routes,
          smartMatching: { enabled: false, profile: null },
          points,
          smartPoints: [],
          style: {
            color: line.color,
            width: line.width,
          },
        },
      });

      mapView.move(points[0], 6, 0, 0);
    };

    reader.readAsText(file);
  },
});
