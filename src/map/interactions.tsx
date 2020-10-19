import { Position } from "@turf/turf";
import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import { MapLayerMouseEvent, MapMouseEvent, MapTouchEvent, MapWheelEvent } from "mapbox-gl";

import { getState, State } from "~/core/app";
import { getSelectedEntities, getSelectedEntity, getSelectedItinerary } from "~/core/selectors";

const isMultitouchEvent = (event?: MapMouseEvent | MapTouchEvent) => {
  return event && "touches" in event.originalEvent && event.originalEvent?.touches?.length > 1;
};

let justTouched = false;

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
    app.map.move(map.getCenter().toArray(), map.getZoom(), map.getBearing(), map.getPitch());

    app.map.updateFeatures(map.getCenter().toArray());
  };

  const onMouseMove = throttle((event: MapMouseEvent | MapTouchEvent) => {
    const state = getState();

    touch();
    if (justTouched && isMultitouchEvent(event)) {
      app.routes.stopRoute();
      return;
    }

    if (state.routes.isDrawing) {
      app.routes.addRouteStep(event.lngLat.toArray());
    } else if (state.editor.mode === "draw") {
      app.routes.updateNextPoint(event.lngLat.toArray());
    }

    if (state.dragAndDrop.draggedEntityId) {
      app.dragAndDrop.dragSelectedPin(event.lngLat.toArray());
    }

    if (state.selection.area) {
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

    // handle draw mode
    if (state.editor.mode === "draw") {
      event.preventDefault();

      // end route if we're clicking on the routesStop target
      const routesStops = map.queryRenderedFeatures(event.point, { layers: ["routesStop"] });
      if (routesStops.length) {
        app.routes.stopRoute();

        event.preventDefault();
        event.originalEvent.stopPropagation();
      } else {
        // otherwise start a route
        app.routes.startRoute(event.lngLat.toArray());
      }
      return;
    }

    // handle pins drag start
    if (state.editor.mode === "select") {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["pins", "pinsInteractions"],
      });

      if (features?.length) {
        event.preventDefault();

        app.dragAndDrop.startDrag(features[0].id as number, event.lngLat.toArray());
        return;
      }
    }

    // handle selection drag start
    if (state.editor.mode === "select" && !state.dragAndDrop.draggedEntityId) {
      event.preventDefault();

      if (state.keyboard.shiftKey) {
        app.selection.preserveSelection();
      }

      app.selection.startArea(event.lngLat.toArray());
      return;
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

    // place a pin
    if (state.editor.mode === "pin") {
      app.pins.place(event.lngLat.toArray());
      return;
    }

    // select the given pin or route
    if (state.editor.mode === "select") {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["pins", "pinsInteractions", "routesInteractions"],
      });

      if (features?.length) {
        const featureId = features[0].id as number;

        if (state.keyboard.shiftKey) {
          app.selection.toggleEntitySelection(featureId);
        } else {
          app.selection.selectEntity(featureId);
        }
        return;
      }
    }

    // add a step to the itinerary mode
    if (state.editor.mode === "select" || state.editor.mode === "itinerary") {
      const itinerary = getSelectedItinerary(state);

      if (!!itinerary) {
        app.itineraries.addManualStep(event.lngLat.toArray());
      } else {
        app.selection.clear();
      }
      return;
    }
  };

  const onFeatureRightClick = (event: MapMouseEvent | MapTouchEvent) => {
    const features = map.queryRenderedFeatures(event.point, {
      layers: ["pins", "pinsInteractions", "routesInteractions"],
    });

    if (!features?.length) {
      return;
    }

    app.editor.setEditorMode("select");
    app.selection.selectEntity(features[0].id as number);
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

  const onFeatureHover = (event: MapLayerMouseEvent) => {
    const state = getState();

    if (!event.features?.length) {
      return;
    }

    if (state.editor.mode !== "select") {
      return;
    }

    // remove previous hover if it changed
    if (
      state.dragAndDrop.hoveredEntityId &&
      state.dragAndDrop.hoveredEntityId !== event.features[0].id &&
      state.dragAndDrop.hoveredEntitySource
    ) {
      map.setFeatureState(
        { id: state.dragAndDrop.hoveredEntityId, source: state.dragAndDrop.hoveredEntitySource },
        {
          hover: false,
        }
      );
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

  map.scrollZoom.setZoomRate(0.03);

  updateMap();

  ["pinsInteractions", "pins", "routesInteractions", "routesStop"].forEach((layer: string) => {
    map.on("mousemove", layer, onFeatureHover);
    map.on("mouseleave", layer, onFeatureHoverEnd);
  });

  map.on("contextmenu", onFeatureRightClick);

  map.on("mousemove", onMouseMove);
  map.on("touchmove", onMouseMove);

  map.on("mousedown", onMouseDown);
  map.on("touchstart", onMouseDown);

  map.on("mouseup", onMouseUp);
  map.on("touchend", onMouseUp);

  map.on("click", onClick);
  map.on("touchend", onClick);

  map.on("wheel", onWheel);

  map.on("moveend", updateMap);

  window.addEventListener("blur", onWindowBlur);

  canvas.addEventListener("keydown", onCanvasKeyUp);
};
