import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import { MapLayerMouseEvent, MapLayerTouchEvent, MapMouseEvent, MapTouchEvent, MapWheelEvent } from "mapbox-gl";

import { getState, State } from "~/core/app";
import { Coordinates, Point, Position } from "~/core/geometries";
import { isClient } from "~/lib/ssr";

const touchDevice = isClient && "ontouchstart" in document.documentElement;

const isMultitouchEvent = (event?: MapMouseEvent | MapTouchEvent) => {
  return event && "touches" in event.originalEvent && event.originalEvent?.touches?.length > 1;
};

let justClickedLayer = false;
let justTouched = false;

const clickLayer = () => {
  justClickedLayer = true;

  setTimeout(() => {
    justClickedLayer = false;
  }, 200);
};

const touch = (event?: MapMouseEvent | MapTouchEvent) => {
  if (isMultitouchEvent(event)) {
    return;
  }

  justTouched = true;

  setTimeout(() => {
    justTouched = false;
  }, 50);
};

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

  const updateMapView = () => {
    const { lng, lat } = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();
    const bounds = map.getBounds();

    const bbox: [Coordinates, Coordinates] = [
      { latitude: bounds.getNorthWest().lat, longitude: bounds.getNorthWest().lng },
      { latitude: bounds.getSouthEast().lat, longitude: bounds.getSouthEast().lng },
    ];

    app.mapView.move({ latitude: lat, longitude: lng }, zoom, bearing, pitch, bbox);

    app.mapView.updateFeatures({ latitude: lat, longitude: lng });
  };

  const onMouseMove = throttle((event: MapMouseEvent | MapTouchEvent) => {
    const {
      line: { currentLine },
      dragAndDrop: { draggedGeometryId },
    } = getState();

    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.line.stopDrawing();
      return;
    }

    const { lat, lng } = event.lngLat;

    if (currentLine) {
      app.line.draw(lat, lng);
    }

    if (draggedGeometryId) {
      app.dragAndDrop.dragSelectedPin({ latitude: lat, longitude: lng });
    }
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent | MapTouchEvent) => {
    const { editor } = getState();

    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.line.stopDrawing();
      return;
    }

    if (justClickedLayer) {
      return;
    }

    if (editor.mode !== "draw") {
      return;
    }

    event.preventDefault();
    app.line.startDrawing(event.lngLat.lat, event.lngLat.lng);
  };

  const onMouseUp = (event?: MapMouseEvent | MapTouchEvent) => {
    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.line.stopDrawing();
      return;
    }

    const {
      editor,
      dragAndDrop: { draggedGeometryId },
    } = getState();

    if (editor.mode === "draw") {
      app.line.stopSegment();
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

    if (editor.mode === "draw") {
      app.line.draw(event.lngLat.lat, event.lngLat.lng);
    }

    if (!justClickedLayer && editor.mode === "itinerary") {
      const { lat, lng } = event.lngLat;

      app.itineraries.addStep({ latitude: lat, longitude: lng });
    }

    if (!justClickedLayer) {
      app.selection.unselectGeometry();
    }
  };

  const onFeatureClick = (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
    const { editor } = getState();
    clickLayer();

    if (editor.mode !== "select") {
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

    app.editor.setEditorMode("select");
    app.selection.selectGeometry(event.features[0]);
  };

  const onFeatureMouseDown = (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
    const { editor } = getState();

    if (editor.mode !== "select") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    event.preventDefault();

    app.dragAndDrop.startDrag(event.features[0].id as number);
  };

  const onWindowBlur = () => {
    onMouseUp();
  };

  const onCanvasKeyUp = (event: KeyboardEvent) => {
    const {
      selection: { selectedGeometryId },
      geometries,
    } = getState();

    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selectedGeometryId) as Point;

    const coefficient = event.shiftKey ? 0.1 : 0.01;

    const keyCodeToDirection: { [key: number]: Position } = {
      [KeyCode.KEY_LEFT]: { x: -coefficient, y: 0 },
      [KeyCode.KEY_UP]: { x: 0, y: -coefficient },
      [KeyCode.KEY_RIGHT]: { x: coefficient, y: 0 },
      [KeyCode.KEY_DOWN]: { x: 0, y: coefficient },
    };

    if (keyCodeToDirection[event.keyCode] && selectedGeometry?.type === "Point") {
      event.preventDefault();
      event.stopPropagation();

      app.pin.nudgeSelectedPin(keyCodeToDirection[event.keyCode]);
    }

    if (event.keyCode === KeyCode.KEY_BACK_SPACE && selectedGeometry) {
      event.preventDefault();
      event.stopPropagation();

      app.selection.deleteSelectedGeometry();
    }

    if (event.keyCode === KeyCode.KEY_ESCAPE) {
      event.preventDefault();
      event.stopPropagation();

      app.selection.unselectGeometry();
      app.line.stopDrawing();
    }
  };

  const onFeatureHoverStart = (event: MapLayerMouseEvent) => {
    if (!event.features?.length) {
      return;
    }

    app.dragAndDrop.startHover(event.features[0].id as number, event.features[0].source);

    map.setFeatureState(event.features[0], {
      hover: true,
    });
  };

  const onFeatureHoverEnd = () => {
    const {
      dragAndDrop: { hoveredGeometryId, hoveredGeometrySource },
    } = getState();

    if (!hoveredGeometryId || !hoveredGeometrySource) {
      return;
    }

    app.dragAndDrop.endHover();

    map.setFeatureState(
      { id: hoveredGeometryId, source: hoveredGeometrySource },
      {
        hover: false,
      }
    );
  };

  const onRouteStopClick = (event: MapMouseEvent | MapTouchEvent) => {
    clickLayer();
    app.line.stopDrawing();

    event.preventDefault();
    event.originalEvent.stopPropagation();
  };

  if (!touchDevice) {
    map.dragPan.disable();
  }

  map.scrollZoom.setZoomRate(0.03);

  updateMapView();

  map.on("mouseenter", "pins", onFeatureHoverStart);
  map.on("mouseleave", "pins", onFeatureHoverEnd);
  map.on("mouseenter", "routes", onFeatureHoverStart);
  map.on("mouseleave", "routes", onFeatureHoverEnd);
  map.on("mouseenter", "routesStop", onFeatureHoverStart);
  map.on("mouseleave", "routesStop", onFeatureHoverEnd);
  map.on("mousedown", "routesStop", onRouteStopClick);
  map.on("touchstart", "routesStop", onRouteStopClick);
  map.on("click", "pins", onFeatureClick);
  map.on("click", "routes", onFeatureClick);
  map.on("touchend", "pins", onFeatureClick);
  map.on("touchend", "routes", onFeatureClick);
  map.on("contextmenu", "pins", onFeatureRightClick);
  map.on("contextmenu", "routes", onFeatureRightClick);
  map.on("mousedown", "pins", onFeatureMouseDown);
  map.on("touchstart", "pins", onFeatureMouseDown);

  map.on("moveend", updateMapView);
  map.on("mousemove", onMouseMove);
  map.on("mousedown", onMouseDown);
  map.on("mouseup", onMouseUp);
  map.on("touchmove", onMouseMove);
  map.on("touchstart", onMouseDown);
  map.on("touchend", onMouseUp);
  map.on("click", onClick);
  map.on("wheel", onWheel);

  window.addEventListener("blur", onWindowBlur);

  canvas.addEventListener("keydown", onCanvasKeyUp);
};