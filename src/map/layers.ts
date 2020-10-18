import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map): void => {
  addLayer(map, {
    id: "selectionAreaFill",
    type: "fill",
    source: MapSource.SelectionArea,
    interactive: false,
    paint: {
      "fill-color": theme.colors.blue[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: "selectionAreaContour",
    type: "line",
    source: MapSource.SelectionArea,
    interactive: false,
    paint: {
      "line-color": theme.colors.blue[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: "overlaysBackground",
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.orange[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, {
    id: "overlaysPoint",
    type: "circle",
    source: MapSource.Overlays,
    interactive: false,
    filter: ["==", ["get", "target"], "Point"],
    paint: {
      "circle-radius": 10,
      "circle-opacity": 0.1,
      "circle-stroke-color": theme.colors.orange[500],
      "circle-stroke-width": 1,
      "circle-color": theme.colors.orange[500],
    },
  });

  addLayer(map, {
    id: "overlaysContour",
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "line-color": theme.colors.orange[500],
      "line-width": 1,
    },
  });

  addLayer(map, {
    id: "routes",
    before: "waterway-label",
    type: "line",
    source: MapSource.Routes,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "color"],
      "line-width": ["get", "width"],
      "line-opacity": 1,
    },
  });

  addLayer(map, {
    id: "routesOutlines",
    before: "routes",
    type: "line",
    source: MapSource.Routes,
    layout: {
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "outlineColor"],
      "line-width": ["+", ["get", "width"], ["get", "outlineWidth"]],
      "line-blur": ["get", "outlineBlur"],
      "line-opacity": 1,
    },
  });

  addLayer(map, {
    id: "routesInteractions",
    before: "routes",
    type: "line",
    source: MapSource.Routes,
    paint: {
      "line-width": ["+", ["get", "width"], 15],
      "line-opacity": 0,
    },
  });

  addLayer(map, {
    id: "routesStop",
    before: "waterway-label",
    type: "circle",
    source: MapSource.Routes,
    filter: ["==", ["get", "target"], "Point"],
    paint: {
      "circle-radius": 10,
      "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], true], 0.5, 0.1],
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": 1,
      "circle-color": ["get", "color"],
    },
  });

  addLayer(map, {
    id: "pins",
    type: "symbol",
    source: MapSource.Pins,
    layout: {
      "icon-image": ["concat", "pin", "-", "pelipin", "-", ["get", "color"]],
      "icon-size": ["*", 0.2, ["get", "width"]],
      "icon-offset": [0, -20],
      "icon-allow-overlap": true,
      "text-allow-overlap": true,
    },
    paint: {},
  });

  addLayer(map, {
    id: "pinIcons",
    type: "symbol",
    source: MapSource.Pins,
    layout: {
      "icon-image": ["concat", "icon", "-", ["concat", ["get", "icon"], "-", ["get", "color"]]],
      "icon-size": ["*", 0.25, ["get", "width"]],
      "icon-offset": [0, -20],
      "icon-allow-overlap": true,
      "text-allow-overlap": true,
    },
  });

  addLayer(map, {
    id: "pinsInteractions",
    type: "circle",
    source: MapSource.Pins,
    paint: {
      "circle-radius": ["+", ["get", "width"], 5],
      "circle-opacity": 0,
    },
  });
};

const addLayer = (map: mapboxgl.Map, layer: mapboxgl.Layer & { before?: string }) => {
  if (map.getLayer(layer.id)) {
    return;
  }

  map.addLayer(layer, layer.before && map.getLayer(layer.before) ? layer.before : undefined);
};
