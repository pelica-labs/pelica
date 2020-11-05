import CheapRuler from "cheap-ruler";
import { memoize, throttle } from "lodash";
import { MapMouseEvent, MapTouchEvent } from "mapbox-gl";

import { app, getState } from "~/core/app";
import { canSelect, getMap, getSelectedItinerary } from "~/core/selectors";
import { ID } from "~/lib/id";
import { MapLayer } from "~/map/layers";

type TouchEventHandler = (event: MapMouseEvent | MapTouchEvent) => void;

const handleSingleTouchEvent = (handler: TouchEventHandler): TouchEventHandler => {
  let timeout: NodeJS.Timeout | null = null;

  return (event) => {
    const isMultitouch = "touches" in event.originalEvent && event.originalEvent.touches.length > 1;

    if (!isMultitouch) {
      timeout = setTimeout(() => {
        handler(event);
      }, 50);
    }

    if (isMultitouch && timeout) {
      clearTimeout(timeout);
      timeout = null;

      event.originalEvent.preventDefault();
      event.originalEvent.stopPropagation();
      event.originalEvent.stopImmediatePropagation();
    }
  };
};

export const applyClickInteractions = (): void => {
  const map = getMap();

  const onMouseEvent = throttle((event: MapMouseEvent) => {
    const state = getState();

    if (state.editor.moving) {
      return;
    }

    if (state.editor.mode === "draw") {
      app.routes.updateNextPoint(event.lngLat.toArray());
    } else if (state.editor.mode === "text") {
      app.texts.updateNextPoint(event.lngLat.toArray());
    } else if (state.editor.mode === "pin") {
      app.pins.updateNextPoint(event.lngLat.toArray());
    }
  }, 1000 / 30);

  const onMouseMove = throttle((event: MapMouseEvent | MapTouchEvent) => {
    const state = getState();

    if (state.editor.moving) {
      return;
    }

    if (state.routes.isDrawing) {
      // find the closest line feature and project to it if we're in match mode
      const point = state.routes.smartMatching.enabled ? snap(map, event) : event.lngLat.toArray();
      app.routes.addRouteStep(point, true);
    }

    if (state.dragAndDrop.draggedEntityId) {
      app.dragAndDrop.dragSelectedEntity(event.lngLat.toArray());
    }

    if (state.selection.area) {
      app.selection.updateArea(event.lngLat.toArray());
    }
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent | MapTouchEvent) => {
    const state = getState();

    if (state.editor.moving) {
      return;
    }

    // handle draw mode
    if (state.editor.mode === "draw") {
      event.preventDefault();

      // end route if we're clicking on the routesStop target
      const [routeStop] = map.queryRenderedFeatures(event.point, { layers: [MapLayer.RoutesStop] });
      const [routeStart] = map.queryRenderedFeatures(event.point, { layers: [MapLayer.RoutesStart] });
      if (routeStop) {
        app.routes.stopRoute();

        event.preventDefault();
        event.originalEvent.stopPropagation();
      } else if (routeStart) {
        app.routes.closeRoute();

        event.preventDefault();
        event.originalEvent.stopPropagation();
      } else {
        // otherwise start a route segment
        const point = state.routes.smartMatching.enabled ? snap(map, event) : event.lngLat.toArray();
        app.routes.startRoute(point);
      }
      return;
    }

    // handle pins drag start
    if (state.editor.mode === "select") {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [MapLayer.Pins, MapLayer.PinsInteractions, MapLayer.Texts, MapLayer.RoutesVertices],
      });

      if (feature) {
        event.preventDefault();

        app.dragAndDrop.startDrag(feature.id as ID, event.lngLat.toArray());
        return;
      }
    }

    // handle selection drag start
    if (state.editor.mode === "select" && !state.dragAndDrop.draggedEntityId) {
      event.preventDefault();

      if (state.platform.keyboard.shiftKey) {
        app.selection.preserveSelection();
      }

      app.selection.startArea(event.lngLat.toArray());
      return;
    }
  };

  const onMouseUp = (event: MapMouseEvent | MapTouchEvent) => {
    const state = getState();

    if (state.editor.moving) {
      return;
    }

    if (state.editor.mode === "draw") {
      app.routes.stopSegment();
    }

    if (state.selection.area) {
      app.selection.endArea();
    }

    if (state.dragAndDrop.draggedEntityId) {
      app.dragAndDrop.endDragSelectedEntity(event.lngLat.toArray());
    }
  };

  const onClick = (event: MapMouseEvent) => {
    const state = getState();

    // place a pin
    if (state.editor.mode === "pin" && !state.editor.moving) {
      app.pins.place(event.lngLat.toArray());
      return;
    }

    // place text
    if (state.editor.mode === "text" && !state.editor.moving) {
      app.texts.place(event.lngLat.toArray());
      return;
    }

    // select the given entity
    if (canSelect(state) || state.editor.moving) {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [
          MapLayer.Pins,
          MapLayer.PinsInteractions,
          MapLayer.RoutesInteractions,
          MapLayer.Texts,
          MapLayer.RoutesEdges,
          MapLayer.RoutesVertices,
        ],
      });

      if (feature) {
        const featureId = feature.id as ID;

        if (feature.layer.id === MapLayer.RoutesEdges) {
          app.routes.insertPoint(featureId);
        } else if (feature.layer.id === MapLayer.RoutesVertices) {
          app.routes.deletePoint(featureId);
        } else if (state.platform.keyboard.shiftKey) {
          app.selection.toggleEntitySelection(featureId);
        } else {
          app.editor.setEditorMode("select");
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

  map.on("touchmove", handleSingleTouchEvent(onMouseMove));
  map.on("touchstart", handleSingleTouchEvent(onMouseDown));
  map.on("touchend", handleSingleTouchEvent(onMouseUp));

  map.on("mousemove", onMouseMove);
  map.on("mousedown", onMouseDown);
  map.on("mouseup", onMouseUp);
  map.on("click", onClick);

  ["mousemove", "mousedown", "mouseup", "click"].forEach((event) => {
    map.on(event, onMouseEvent);
  });
};

const hierarchy: { [key: string]: number } = {
  trunk: 2,
  motorway: 2,
  primary: 3,
  secondary: 4,
  tertiary: 5,
};

const snap = (map: mapboxgl.Map, event: MapMouseEvent | MapTouchEvent) => {
  const ruler = new CheapRuler(event.lngLat.lat);

  const point = event.lngLat.toArray() as [number, number];

  const features = map.queryRenderedFeatures([
    [event.point.x - 10, event.point.y - 10],
    [event.point.x + 10, event.point.y + 10],
  ]);

  const getDistance = memoize((f) => ruler.distance(point, ruler.pointOnLine(getCoords(f), point).point));

  const roads = features
    .filter((f) => f.layer["source-layer"] === "road")
    .sort((a, b) => {
      return hierarchy[a.properties?.type] === hierarchy[b.properties?.type]
        ? getDistance(a) - getDistance(b)
        : hierarchy[a.properties?.type] - hierarchy[b.properties?.type];
    });

  if (roads.length) {
    try {
      const road = roads[0];
      const coords = getCoords(road);

      const proj = ruler.pointOnLine(coords as [number, number][], event.lngLat.toArray() as [number, number]);
      return proj.point;
    } catch (error) {
      return event.lngLat.toArray();
    }
  }

  return event.lngLat.toArray();
};

const getCoords = (feature: GeoJSON.Feature): [number, number][] => {
  return (feature.geometry.type === "MultiLineString"
    ? feature.geometry.coordinates.flat()
    : feature.geometry.type === "LineString"
    ? feature.geometry.coordinates
    : []) as [number, number][];
};
