import { throttle } from "lodash";
import mapboxgl from "mapbox-gl";

import { app } from "~/core/app";

export const applyResizeInteractions = (map: mapboxgl.Map): void => {
  map.on(
    "resize",
    throttle(() => {
      app.map.updateCanvasSize();
    }, 1000 / 30)
  );
};
