import { MapSource } from "~/lib/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map): void => {
  addLayer(map, {
    id: "overlaysBackground",
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.green[500],
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
      "circle-stroke-color": theme.colors.green[500],
      "circle-stroke-width": 1,
      "circle-color": theme.colors.green[500],
    },
  });

  addLayer(map, {
    id: "overlaysContour",
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "line-color": theme.colors.green[500],
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
      "line-color": ["get", "strokeColor"],
      "line-width": ["get", "strokeWidth"],
    },
  });

  addLayer(map, {
    id: "pins",
    type: "symbol",
    source: MapSource.Pins,
    layout: {
      "icon-image": ["concat", "pin", "-", "pelipin", "-", ["get", "strokeColor"]],
      "icon-size": ["*", 0.2, ["get", "strokeWidth"]],
      "icon-offset": [0, -20],
      "icon-allow-overlap": true,
      "text-allow-overlap": true,
    },
  });

  addLayer(map, {
    id: "pinIcons",
    type: "symbol",
    source: MapSource.Pins,
    layout: {
      "icon-image": ["concat", "icon", "-", ["concat", ["get", "icon"], "-", ["get", "strokeColor"]]],
      "icon-size": ["*", 0.25, ["get", "strokeWidth"]],
      "icon-offset": [0, -20],
      "icon-allow-overlap": true,
      "text-allow-overlap": true,
    },
  });
};

const addLayer = (map: mapboxgl.Map, layer: mapboxgl.Layer & { before?: string }) => {
  if (map.getLayer(layer.id)) {
    return;
  }

  map.addLayer(layer, layer.before);
};
