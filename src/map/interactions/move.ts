import mapboxgl from "mapbox-gl";

import { app } from "~/core/app";

export const applyMoveInteractions = (map: mapboxgl.Map): void => {
  const onMoveEnd = () => {
    app.map.move(map.getCenter().toArray(), map.getZoom(), map.getBearing(), map.getPitch());
    app.map.updateFeatures(map.getCenter().toArray());
  };

  map.on("moveend", onMoveEnd);

  // Call it straight away to have an up to date state.
  onMoveEnd();
};
