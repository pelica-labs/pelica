import { MapSource } from "~/lib/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map): void => {
  addLayer(
    map,
    "routes",
    {
      type: "line",
      source: MapSource.Routes,
      layout: {
        "line-cap": "round",
      },
      paint: {
        "line-color": ["get", "strokeColor"],
        "line-width": ["get", "strokeWidth"],
      },
    },
    "waterway-label"
  );

  addLayer(
    map,
    "pins",
    {
      type: "circle",
      source: MapSource.Pins,
      paint: {
        "circle-color": ["get", "strokeColor"],
        "circle-radius": ["get", "strokeWidth"],
      },
    },
    "waterway-label"
  );

  addLayer(map, "overlaysBackground", {
    type: "fill",
    source: MapSource.Overlays,
    interactive: false,
    paint: {
      "fill-color": theme.colors.green[500],
      "fill-opacity": 0.1,
    },
  });

  addLayer(map, "overlaysContour", {
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

const addLayer = (
  map: mapboxgl.Map,
  id: MapSource | string,
  layer: Omit<mapboxgl.Layer, "id">,
  beforeLayer?: string
) => {
  if (map.getLayer(id)) {
    return;
  }

  if (beforeLayer && map.getLayer(beforeLayer)) {
    map.addLayer(
      {
        id,
        ...layer,
      },
      beforeLayer
    );
  } else {
    map.addLayer({
      id,
      ...layer,
    });
  }
};
