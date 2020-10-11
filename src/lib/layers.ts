import { MapSource } from "~/lib/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map): void => {
  addLayer(map, "overlaysBackground", {
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.green[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, "overlaysPoint", {
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

  addLayer(map, "overlaysContour", {
    type: "line",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "line-color": theme.colors.green[500],
      "line-width": 1,
      // "line-dasharray": [3, 1],
    },
  });
  addLayer(map, "routes", {
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

  addLayer(map, "pinIcons", {
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

const addLayer = (map: mapboxgl.Map, id: MapSource | string, layer: Omit<mapboxgl.Layer, "id">) => {
  if (map.getLayer(id)) {
    return;
  }

  map.addLayer({
    id,
    ...layer,
  });
};
