import { MapMouseEvent, MapTouchEvent } from "mapbox-gl";

import { app } from "~/core/app";
import { getMap } from "~/core/selectors";
import { ID } from "~/lib/id";

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
    app.selection.selectEntity(features[0].id as ID);
  };

  map.on("contextmenu", onFeatureRightClick);
};
