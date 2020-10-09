import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import { MapLayerMouseEvent, MapLayerTouchEvent, MapMouseEvent, MapWheelEvent } from "mapbox-gl";

import { State } from "~/core/app";
import { getState } from "~/core/app";
import { Point, Position } from "~/lib/geometry";
import { MapSource } from "~/lib/sources";

export const applyInteractions = (map: mapboxgl.Map, app: State): void => {
  const canvas = map.getCanvas();

  const onWheel = (event: MapWheelEvent) => {
    const { originalEvent } = event;

    // Shift scroll for horizontal zoom is natively handled.

    // Meta key always triggers the native zoom.
    if (originalEvent.metaKey) {
      return;
    }

    // 🧙‍♂️
    // During a pinch event, the browser thinks CTRL is pressed.
    if (originalEvent.ctrlKey) {
      return;
    }

    const x = originalEvent.deltaX;
    const y = originalEvent.deltaY;

    map.panBy([x, y], { animate: false });

    event.preventDefault();
  };

  const onMoveEnd = (event: MapMouseEvent) => {
    const { lng, lat } = event.target.getCenter();
    const zoom = event.target.getZoom();
    const bearing = event.target.getBearing();
    const pitch = event.target.getPitch();

    app.mapView.move({ latitude: lat, longitude: lng }, zoom, bearing, pitch);
  };

  const onMouseMove = throttle((event: MapMouseEvent) => {
    const {
      line: { currentDraw },
      dragAndDrop: { draggedGeometryId },
    } = getState();

    event.preventDefault();

    const { lat, lng } = event.lngLat;

    if (currentDraw) {
      app.line.draw(lat, lng);
    }

    if (draggedGeometryId) {
      app.dragAndDrop.dragSelectedPin({ latitude: lat, longitude: lng });
    }
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent) => {
    const { editor } = getState();

    if (event.originalEvent.which !== 1) {
      return;
    }

    if (editor.mode !== "draw") {
      return;
    }

    event.preventDefault();
    app.line.startDrawing();
  };

  const onMouseUp = (event?: MapMouseEvent) => {
    const {
      editor,
      dragAndDrop: { draggedGeometryId },
    } = getState();

    if (editor.mode === "draw") {
      app.line.endDrawing();
    }

    if (draggedGeometryId && event) {
      const { lat, lng } = event.lngLat;

      app.dragAndDrop.endDragSelectedPin({ latitude: lat, longitude: lng });
    }
  };

  const onClick = (event: MapMouseEvent) => {
    const { editor } = getState();

    if (editor.mode === "pin") {
      app.pin.place(event.lngLat.lat, event.lngLat.lng);
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

    app.selection.selectGeometry(event.features[0]);
  };

  const onFeatureRightClick = (event: MapLayerMouseEvent) => {
    if (!event.features?.length) {
      return;
    }

    app.editor.setEditorMode("move");
    app.selection.selectGeometry(event.features[0]);
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

    app.dragAndDrop.startDrag(event.features[0]);
  };

  const onWindowBlur = () => {
    onMouseUp();
  };

  const onCanvasKeyUp = (event: KeyboardEvent) => {
    const {
      selection: { selectedGeometryId },
      geometries,
    } = getState();

    if (!selectedGeometryId) {
      return;
    }

    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selectedGeometryId) as Point;

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

      app.pin.moveSelectedPin(keyCodeToDirection[event.keyCode]);
      console.log("moving selected pin");
    }

    if (event.keyCode === KeyCode.KEY_BACK_SPACE) {
      event.preventDefault();
      event.stopPropagation();

      app.selection.deleteSelectedGeometry();
    }

    if (event.keyCode === KeyCode.KEY_ESCAPE) {
      event.preventDefault();
      event.stopPropagation();

      app.selection.unselectGeometry();
    }
  };

  canvas.style.cursor = "default";

  map.dragPan.disable();
  map.scrollZoom.setZoomRate(0.03);

  map.on("moveend", onMoveEnd);
  map.on("mousemove", onMouseMove);
  map.on("mousedown", onMouseDown);
  map.on("mouseup", onMouseUp);
  map.on("touchmove", onMouseMove);
  map.on("touchstart", onMouseDown);
  map.on("touchend", onMouseUp);
  map.on("click", onClick);
  map.on("wheel", onWheel);

  map.on("click", MapSource.Pins, onFeatureClick);
  map.on("click", MapSource.Routes, onFeatureClick);
  map.on("contextmenu", MapSource.Pins, onFeatureRightClick);
  map.on("contextmenu", MapSource.Routes, onFeatureRightClick);
  map.on("mousedown", MapSource.Pins, onFeatureMouseDown);
  map.on("touchstart", MapSource.Pins, onFeatureMouseDown);

  window.addEventListener("blur", onWindowBlur);

  canvas.addEventListener("keydown", onCanvasKeyUp);
};
