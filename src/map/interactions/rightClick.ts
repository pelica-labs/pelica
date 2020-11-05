import { MapMouseEvent, MapTouchEvent } from "mapbox-gl";

import { app } from "~/core/app";
import { getMap } from "~/core/selectors";
import { ID } from "~/lib/id";

export const applyRightClickInteractions = (): void => {
  const map = getMap();

  const onFeatureRightClick = (event: MapMouseEvent | MapTouchEvent) => {
    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: ["pins", "pinsInteractions", "routesInteractions", "texts"],
    });

    if (!feature) {
      return;
    }

    app.editor.setEditorMode("select");
    app.selection.selectEntity(feature.id as ID);
  };

  map.on("contextmenu", onFeatureRightClick);
};
