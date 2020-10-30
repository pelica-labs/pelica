import { MapMouseEvent, MapTouchEvent } from "mapbox-gl";

import { app } from "~/core/app";
import { getMap } from "~/core/selectors";

export const applyRightClickInteractions = (): void => {
  const map = getMap();

  const onFeatureRightClick = (event: MapMouseEvent | MapTouchEvent) => {
    const features = map.queryRenderedFeatures(event.point, {
      layers: ["pins", "pinsInteractions", "routesInteractions", "texts"],
    });

    if (!features?.length) {
      return;
    }

    app.editor.setEditorMode("select");
    app.selection.selectEntity(features[0].id as number);
  };

  map.on("contextmenu", onFeatureRightClick);
};
