import { getState } from "~/core/app";
import { getMap } from "~/core/selectors";
import { SkyboxMode } from "~/core/terrain";
import { MapLayer } from "~/map/layers";
import { MapSource } from "~/map/sources";

type SunConfiguration = {
  position: [number, number];
  intensity: number;
};

const SunConfigurations: { [key in SkyboxMode]: SunConfiguration } = {
  day: {
    position: [0, 0],
    intensity: 5,
  },
  night: {
    position: [0, 90],
    intensity: 0,
  },
  sunrise: {
    position: [90, 85],
    intensity: 1,
  },
  sunset: {
    position: [270, 85],
    intensity: 1,
  },
};

export const applyTerrain = (): void => {
  const map = getMap();
  const state = getState();

  if (!map.getSource(MapSource.MapboxDem)) {
    map.addSource(MapSource.MapboxDem, {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 14,
    });
  }

  if (state.terrain.enabled) {
    map.setTerrain({
      source: MapSource.MapboxDem,
      exaggeration: state.terrain.exageration / 100,
    });
  } else {
    map.setTerrain(null);
  }

  if (map.getLayer(MapLayer.Sky)) {
    map.removeLayer(MapLayer.Sky);
  }

  const sunConfiguration = SunConfigurations[state.terrain.skyboxMode as SkyboxMode];

  map.addLayer({
    id: MapLayer.Sky,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    type: "sky",
    paint: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "sky-type": "atmosphere",
      "sky-atmosphere-color": state.terrain.skyColor,
      "sky-atmosphere-sun": sunConfiguration.position,
      "sky-atmosphere-sun-intensity": sunConfiguration.intensity,
    },
  });
};
