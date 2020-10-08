import { App } from "~/core/helpers";
import { nextGeometryId } from "~/lib/geometry";
import { parseGpx } from "~/lib/gpx";
import { MapSource } from "~/lib/sources";

export const imports = ({ mutate, get }: App) => ({
  importGpx: (file: File) => {
    const { editor, mapView } = get();

    const reader = new FileReader();

    reader.onload = (file) => {
      const xml = file.target?.result as string;
      if (!xml) {
        return;
      }

      const points = parseGpx(xml);

      mutate(({ history }) => {
        history.actions.push({
          name: "importGpx",
          line: {
            type: "PolyLine",
            id: nextGeometryId(),
            source: MapSource.Routes,
            smartMatching: { enabled: false, profile: null },
            points,
            smartPoints: [],
            style: {
              strokeColor: editor.strokeColor,
              strokeWidth: editor.strokeWidth,
            },
          },
        });
      });

      mapView.move(points[0].latitude, points[0].longitude, 6, 0, 0);
    };

    reader.readAsText(file);
  },
});
