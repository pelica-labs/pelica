import { MapSource } from "~/lib/sources";

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
        "circle-stroke-color": ["get", "strokeColor"],
        "circle-stroke-width": ["get", "strokeWidth"],
      },
    });
  }
};
