import mapboxgl from "mapbox-gl";

import { getState } from "~/core/app";

const layers = [
  "country-label",
  "state-label",
  "settlement-major-label",
  "settlement-minor-label",
  "settlement-subdivision-label",
  "airport-label",
  "poi-label",
  "water-point-label",
  "water-line-label",
  "natural-point-label",
  "natural-line-label",
  "waterway-label",
  "ferry-aerialway-label",
];

export const applyLanguage = (map: mapboxgl.Map): void => {
  const language = getState().editor.language;

  layers.forEach((layer) => {
    if (!map.getLayer(layer)) {
      return;
    }

    map.setLayoutProperty(layer, "text-field", ["get", "name_" + language]);
  });
};
