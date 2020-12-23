import { getMap } from "~/core/selectors";
import { App } from "~/core/zustand";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type SkyboxMode = "day" | "night" | "sunrise" | "sunset";

export type Terrain = {
  enabled: boolean;
  exageration: number;

  buildingsAvailable: boolean;
  buildingsEnabled: boolean;
  buildingsColor: string;
  buildingsOpacity: number;

  skyboxMode: SkyboxMode;
};

export const terrainInitialState: Terrain = {
  enabled: false,
  exageration: 150,

  buildingsAvailable: false,
  buildingsEnabled: false,
  buildingsColor: theme.colors.gray[600],
  buildingsOpacity: 1,

  skyboxMode: "day",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const terrain = ({ mutate, get }: App) => ({
  ...terrainInitialState,

  checkForBuildingsAvailability: () => {
    const available = !!getMap(get()).getLayer(MapSource.Buildings);

    mutate((state) => {
      state.terrain.buildingsAvailable = available;
    });
  },

  toggle: () => {
    mutate((state) => {
      state.terrain.enabled = !state.terrain.enabled;
    });
  },

  setExageration: (exageration: number) => {
    mutate((state) => {
      state.terrain.exageration = exageration;
    });
  },

  toggleBuildings: () => {
    mutate((state) => {
      state.terrain.buildingsEnabled = !state.terrain.buildingsEnabled;
    });
  },

  setBuildingsColor: (color: string) => {
    mutate((state) => {
      state.terrain.buildingsColor = color;
    });
  },

  setBuildingsOpacity: (opacity: number) => {
    mutate((state) => {
      state.terrain.buildingsOpacity = opacity;
    });
  },

  setSkybox: (skybox: SkyboxMode) => {
    mutate((state) => {
      state.terrain.skyboxMode = skybox;
    });
  },
});
