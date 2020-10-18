import { Position } from "@turf/turf";
import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import { MapLayerMouseEvent, MapLayerTouchEvent, MapMouseEvent, MapTouchEvent, MapWheelEvent } from "mapbox-gl";

import { getState, State } from "~/core/app";
import { getSelectedEntities, getSelectedEntity, getSelectedItinerary } from "~/core/selectors";

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

  const updateMap = () => {
    app.map.move(
      map.getCenter().toArray(),
      map.getZoom(),
      map.getBearing(),
      map.getPitch(),
      map.getBounds().toArray().flat() as [number, number, number, number]
    );

    app.map.updateFeatures(map.getCenter().toArray());
  };

  const onMouseMove = throttle((event: MapMouseEvent | MapTouchEvent) => {
    const {
      routes: { isDrawing },
      dragAndDrop: { draggedEntityId },
      selection: { area },
    } = getState();

    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.routes.stopRoute();
      return;
    }

    if (isDrawing) {
      app.routes.addRouteStep(event.lngLat.toArray());
    }

    if (draggedEntityId) {
      app.dragAndDrop.dragSelectedPin(event.lngLat.toArray());
    }

    if (area) {
      app.selection.updateArea(event.lngLat.toArray());
    }
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent | MapTouchEvent) => {
    const state = getState();

    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.routes.stopRoute();
      return;
    }

    if (justClickedLayer) {
      return;
    }

    if (state.editor.mode === "draw") {
      event.preventDefault();

      app.routes.startRoute(event.lngLat.toArray());
    }

    if (state.editor.mode === "select" && !state.dragAndDrop.draggedEntityId) {
      event.preventDefault();

      if (state.keyboard.shiftKey) {
        app.selection.preserveSelection();
      }

      app.selection.startArea(event.lngLat.toArray());
    }
  };

  const onMouseUp = (event?: MapMouseEvent | MapTouchEvent) => {
    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.routes.stopRoute();
      return;
    }

    const {
      editor,
      dragAndDrop: { draggedEntityId },
      selection: { area },
    } = getState();

    if (editor.mode === "draw") {
      app.routes.stopSegment();
    }

    if (area) {
      app.selection.endArea();
    }

    if (draggedEntityId && event) {
      app.dragAndDrop.endDragSelectedPin(event.lngLat.toArray());
    }
  };

  const onClick = (event: MapMouseEvent) => {
    const state = getState();

    if (state.editor.mode === "pin") {
      app.pins.place(event.lngLat.toArray());
    }

    if (state.editor.mode === "draw") {
      app.routes.addRouteStep(event.lngLat.toArray());
    }

    if ((state.editor.mode === "select" || state.editor.mode === "itinerary") && !justClickedLayer) {
      const itinerary = getSelectedItinerary(state);

      if (!!itinerary) {
        app.itineraries.addManualStep(event.lngLat.toArray());
      } else {
        app.selection.clear();
      }
    }
  };

  const onFeatureClick = (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
    const state = getState();

    clickLayer();

    if (state.editor.mode !== "select") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    const featureId = event.features[0].id as number;

    if (state.keyboard.shiftKey) {
      app.selection.toggleEntitySelection(featureId);
    } else {
      app.selection.selectEntity(featureId);
    }
  };

  const onFeatureRightClick = (event: MapLayerMouseEvent) => {
    if (!event.features?.length) {
      return;
    }

    app.editor.setEditorMode("select");
    app.selection.selectEntity(event.features[0].id as number);
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

    app.dragAndDrop.startDrag(event.features[0].id as number, event.lngLat.toArray());
  };

  const onWindowBlur = () => {
    onMouseUp();
  };

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

  const onFeatureHoverStart = (event: MapLayerMouseEvent) => {
    const state = getState();

    if (!event.features?.length) {
      return;
    }

    if (state.editor.mode !== "select") {
      return;
    }

    app.dragAndDrop.startHover(event.features[0].id as number, event.features[0].source);

    map.setFeatureState(event.features[0], {
      hover: true,
    });
  };

  const onFeatureHoverEnd = (event: MapLayerMouseEvent) => {
    const state = getState();

    const features = map.queryRenderedFeatures(event.point);

    if (!state.dragAndDrop.hoveredEntityId || !state.dragAndDrop.hoveredEntitySource) {
      return;
    }

    const stillHovering = features.find((feature) => feature.state.hover);
    if (!stillHovering) {
      app.dragAndDrop.endHover();
    }

    map.setFeatureState(
      { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource },
      {
        hover: false,
      }
    );
  };

  const onRouteStopClick = (event: MapMouseEvent | MapTouchEvent) => {
    clickLayer();
    app.routes.stopRoute();

    event.preventDefault();
    event.originalEvent.stopPropagation();
  };

  map.scrollZoom.setZoomRate(0.03);

  updateMap();

  map.on("mouseenter", "pinsInteractions", onFeatureHoverStart);
  map.on("mouseleave", "pinsInteractions", onFeatureHoverEnd);
  map.on("mouseenter", "pins", onFeatureHoverStart);
  map.on("mouseleave", "pins", onFeatureHoverEnd);
  map.on("mouseenter", "routesInteractions", onFeatureHoverStart);
  map.on("mouseleave", "routesInteractions", onFeatureHoverEnd);
  map.on("mouseenter", "routesStop", onFeatureHoverStart);
  map.on("mouseleave", "routesStop", onFeatureHoverEnd);
  map.on("mousedown", "routesStop", onRouteStopClick);
  map.on("touchstart", "routesStop", onRouteStopClick);
  map.on("click", "pinsInteractions", onFeatureClick);
  map.on("click", "routesInteractions", onFeatureClick);
  map.on("touchend", "pinsInteractions", onFeatureClick);
  map.on("touchend", "routesInteractions", onFeatureClick);
  map.on("contextmenu", "pinsInteractions", onFeatureRightClick);
  map.on("contextmenu", "routesInteractions", onFeatureRightClick);
  map.on("mousedown", "pins", onFeatureMouseDown);
  map.on("mousedown", "pinsInteractions", onFeatureMouseDown);
  map.on("touchstart", "pinsInteractions", onFeatureMouseDown);
  map.on("touchstart", "pins", onFeatureMouseDown);

  map.on("moveend", updateMap);
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
