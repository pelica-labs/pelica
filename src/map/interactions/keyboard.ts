import { Position } from "@turf/turf";
import * as KeyCode from "keycode-js";

import { app, getState } from "~/core/app";
import { getSelectedEntities, getSelectedEntity } from "~/core/selectors";

export const applyKeyboardInteractions = (map: mapboxgl.Map): void => {
  const onCanvasKeyUp = (event: KeyboardEvent) => {
    const state = getState();

    const selectedEntities = getSelectedEntities(state);
    const selectedEntity = getSelectedEntity(state);

    const coefficient = event.shiftKey ? 0.1 : 0.01;

    const keyCodeToDirection: { [key: number]: Position } = {
      [KeyCode.KEY_LEFT]: [-coefficient, 0],
      [KeyCode.KEY_UP]: [0, -coefficient],
      [KeyCode.KEY_RIGHT]: [coefficient, 0],
      [KeyCode.KEY_DOWN]: [0, coefficient],
    };

    if (keyCodeToDirection[event.keyCode] && selectedEntity?.type === "Pin") {
      event.preventDefault();
      event.stopPropagation();

      app.pins.nudgeSelectedPin(keyCodeToDirection[event.keyCode]);
    }

    if (keyCodeToDirection[event.keyCode] && selectedEntity?.type === "Text") {
      event.preventDefault();
      event.stopPropagation();

      app.texts.nudgeSelectedText(keyCodeToDirection[event.keyCode]);
    }

    if (event.keyCode === KeyCode.KEY_BACK_SPACE && selectedEntities.length > 0) {
      event.preventDefault();
      event.stopPropagation();

      app.selection.deleteSelectedEntities();
    }

    if (event.keyCode === KeyCode.KEY_ESCAPE) {
      event.preventDefault();
      event.stopPropagation();

      app.selection.clear();
      app.routes.stopRoute();
    }
  };

  map.getCanvas().addEventListener("keydown", onCanvasKeyUp);
};
