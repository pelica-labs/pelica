import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import { MapLayerMouseEvent, MapLayerTouchEvent, MapMouseEvent } from "mapbox-gl";

import { Position } from "~/lib/geometry";
import { MapSource } from "~/lib/sources";
import { getState, MapStore } from "~/lib/state";

export const applyInteractions = (map: mapboxgl.Map, dispatch: MapStore["dispatch"]): void => {
  const canvas = map.getCanvas();

  const onMoveEnd = (event: MapMouseEvent) => {
    const { lng, lat } = event.target.getCenter();
    const zoom = event.target.getZoom();
    const bearing = event.target.getBearing();
    const pitch = event.target.getPitch();

    dispatch.move(lat, lng, zoom, bearing, pitch);
  };

  const onMouseMove = throttle((event: MapMouseEvent) => {
    const { keyboard, currentDraw, draggedGeometry } = getState();

    if (keyboard.altKey) {
      return;
    }

    event.preventDefault();

    const { lat, lng } = event.lngLat;

    if (currentDraw) {
      dispatch.draw(lat, lng);
    }

    if (draggedGeometry?.type === "Point") {
      dispatch.dragSelectedPin({ latitude: lat, longitude: lng });
    }
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (event.originalEvent.which !== 1) {
      return;
    }

    if (keyboard.altKey || editor.mode !== "draw") {
      return;
    }

    event.preventDefault();
    dispatch.startDrawing();
  };

  const onMouseUp = (event?: MapMouseEvent) => {
    const { keyboard, editor, draggedGeometry } = getState();

    if (keyboard.altKey) {
      return;
    }

    if (editor.mode === "draw") {
      dispatch.endDrawing();
    }

    if (draggedGeometry && event) {
      const { lat, lng } = event.lngLat;

      dispatch.endDragSelectedPin({ latitude: lat, longitude: lng });
    }
  };

  const onClick = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey) {
      return;
    }

    if (editor.mode === "pin") {
      dispatch.pin(event.lngLat.lat, event.lngLat.lng);
    }
  };

  const onFeatureClick = (event: MapLayerMouseEvent) => {
    const { editor } = getState();

    if (editor.mode !== "move") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    dispatch.selectGeometry(event.features[0]);
  };

  const onFeatureRightClick = (event: MapLayerMouseEvent) => {
    if (!event.features?.length) {
      return;
    }

    dispatch.setEditorMode("move");
    dispatch.selectGeometry(event.features[0]);
  };

  const onFeatureMouseDown = (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
    const { editor } = getState();

    if (editor.mode !== "move") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    event.preventDefault();

    dispatch.startDrag(event.features[0]);
  };

  const onWindowBlur = () => {
    onMouseUp();
  };

  const onCanvasKeyUp = (event: KeyboardEvent) => {
    const { selectedGeometry } = getState();

    if (!selectedGeometry) {
      return;
    }

    const coefficient = event.shiftKey ? 0.1 : 0.01;

    const keyCodeToDirection: { [key: number]: Position } = {
      [KeyCode.KEY_LEFT]: { x: -coefficient, y: 0 },
      [KeyCode.KEY_UP]: { x: 0, y: -coefficient },
      [KeyCode.KEY_RIGHT]: { x: coefficient, y: 0 },
      [KeyCode.KEY_DOWN]: { x: 0, y: coefficient },
    };

    if (keyCodeToDirection[event.keyCode] && selectedGeometry.type === "Point") {
      event.preventDefault();
      event.stopPropagation();

      dispatch.moveSelectedPin(keyCodeToDirection[event.keyCode]);
    }

    if (event.keyCode === KeyCode.KEY_BACK_SPACE) {
      event.preventDefault();
      event.stopPropagation();

      dispatch.deleteSelectedGeometry();
    }
  };

  map.on("moveend", onMoveEnd);
  map.on("mousemove", onMouseMove);
  map.on("mousedown", onMouseDown);
  map.on("mouseup", onMouseUp);
  map.on("touchmove", onMouseMove);
  map.on("touchstart", onMouseDown);
  map.on("touchend", onMouseUp);
  map.on("click", onClick);

  map.on("click", MapSource.Pins, onFeatureClick);
  map.on("click", MapSource.Routes, onFeatureClick);
  map.on("contextmenu", MapSource.Pins, onFeatureRightClick);
  map.on("contextmenu", MapSource.Routes, onFeatureRightClick);
  map.on("mousedown", MapSource.Pins, onFeatureMouseDown);
  map.on("touchstart", MapSource.Pins, onFeatureMouseDown);

  window.addEventListener("blur", onWindowBlur);

  canvas.addEventListener("keydown", onCanvasKeyUp);
};
