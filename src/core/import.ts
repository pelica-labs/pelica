import { bbox, lineString } from "@turf/turf";

import { ErrorIcon, WarningIcon } from "~/components/Icon";
import { App } from "~/core/helpers";
import { parseGpx } from "~/lib/gpx";
import { numericId } from "~/lib/id";
import { parseFeatures } from "~/map/features";
import { MapSource } from "~/map/sources";

export const imports = ({ get }: App) => ({
  importFile: (file: File) => {
    const reader = new FileReader();

    reader.onload = (file) => {
      const textContent = file.target?.result as string;
      if (!textContent) {
        return;
      }

      get().imports.importText(textContent);
    };

    reader.readAsText(file);
  },

  importText: (text: string) => {
    let importError: Error | null = null;

    try {
      get().imports.importGeoJson(text);
    } catch (error) {
      importError = error;
    }

    if (importError) {
      importError = null;
      try {
        get().imports.importGpx(text);
      } catch (error) {
        importError = error;
      }
    }

    if (importError) {
      get().alerts.trigger({
        message: `Unable to import file:\n${importError.message}`,
        color: "red",
        icon: ErrorIcon,
        timeout: 3000,
      });
    }
  },

  importGeoJson: (text: string) => {
    const features = parseFeatures(text);

    // @todo: validate JSON

    const insertedCount = get().entities.insertFeatures(features);

    if (insertedCount !== features.length) {
      get().alerts.trigger({
        message: `${features.length - insertedCount} features could not be displayed.`,
        icon: WarningIcon,
      });
    }
  },

  importGpx: (text: string) => {
    const points = parseGpx(text);

    get().history.push({
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
        style: get().routes.style,
      },
    });

    get().map.setBounds(bbox(lineString(points)));
  },
});
