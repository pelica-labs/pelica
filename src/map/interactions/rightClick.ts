import { MapMouseEvent, MapTouchEvent } from "mapbox-gl";

import { app } from "~/core/app";
import { getMap } from "~/core/selectors";
import { ID } from "~/lib/id";
import { MapLayer } from "~/map/layers";

export const applyRightClickInteractions = (): void => {
  const map = getMap();

  const onFeatureRightClick = (event: MapMouseEvent | MapTouchEvent) => {
    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: [MapLayer.Pin, MapLayer.PinInteraction, MapLayer.RouteInteraction, MapLayer.Text],
    });

    if (!feature) {
      return;
    }

    app.editor.setEditorMode("select");
    app.selection.selectEntity(feature.id as ID);
  };

  map.on("contextmenu", onFeatureRightClick);
};
