import { MapSource } from "~/lib/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map): void => {
  addLayer(map, "routes", {
    id: "routes",
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

  addLayer(map, "pins", {
    id: "pins",
    type: "circle",
    source: MapSource.Pins,
    paint: {
      "circle-color": ["get", "strokeColor"],
      "circle-radius": ["get", "strokeWidth"],
    },
  });

  addLayer(map, "overlaysBackground", {
    id: "overlaysBackground",
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.green[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, "overlaysContour", {
    id: "overlaysContour",
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "line-color": theme.colors.green[500],
      "line-width": 2,
      "line-dasharray": [3, 1],
    },
  });
};

const addLayer = (map: mapboxgl.Map, id: MapSource | string, layer: mapboxgl.Layer) => {
  if (map.getLayer(id)) {
    return;
  }

  map.addLayer(layer);
};
