import { throttle } from "lodash";

import { app } from "~/core/app";
import { getMap } from "~/core/selectors";

export const applyResizeInteractions = (): void => {
  const map = getMap();

  map.on(
    "resize",
    throttle(() => {
      app.map.updateCanvasSize();
    }, 1000 / 30)
  );
};
