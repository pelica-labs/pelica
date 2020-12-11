import { getMap } from "~/core/selectors";

export const applyTerrain = (): void => {
  const map = getMap();

  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

  map.addLayer({
    id: "sky",
    type: "sky",
    paint: {
      "sky-type": "atmosphere",
      "sky-atmosphere-sun": [0.0, 0.0],
      "sky-atmosphere-sun-intensity": 15,
    },
  });
};
