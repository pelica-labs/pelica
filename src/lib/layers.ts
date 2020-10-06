import { MapSource } from "~/lib/sources";
import { theme } from "~/styles/tailwind";

export const applyLayers = (map: mapboxgl.Map): void => {
  if (!map.getLayer(MapSource.Routes)) {
    map.addLayer({
      id: MapSource.Routes,
      type: "line",
      source: MapSource.Routes,
      paint: {
        "line-color": ["get", "strokeColor"],
        "line-width": ["get", "strokeWidth"],
      },
    });
  }

  if (!map.getLayer(MapSource.Pins)) {
    map.addLayer({
      id: MapSource.Pins,
      type: "circle",
      source: MapSource.Pins,
      paint: {
        "circle-color": ["get", "strokeColor"],
        "circle-radius": ["get", "strokeWidth"],
        "circle-stroke-width": ["case", ["to-boolean", ["get", "selected"]], 3, 0],
        "circle-stroke-color": [
          "case",
          ["to-boolean", ["get", "selected"]],
          theme.colors.green[500],
          ["get", "strokeColor"],
        ],
      },
    });
  }
};
