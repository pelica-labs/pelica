import { App } from "~/core/zustand";
import { theme } from "~/styles/tailwind";

export type SkyboxMode = "day" | "night" | "sunrise" | "sunset";

export type Terrain = {
  enabled: boolean;
  exageration: number;

  skyColor: string;
  skyboxMode: SkyboxMode;
};

export const terrainInitialState: Terrain = {
  enabled: false,
  exageration: 150,

  skyColor: theme.colors.blue[800],
  skyboxMode: "day",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const terrain = ({ mutate }: App) => ({
  ...terrainInitialState,

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

  setSkyColor: (skyColor: string) => {
    mutate((state) => {
      state.terrain.skyColor = skyColor;
    });
  },

  setSkybox: (skybox: SkyboxMode) => {
    mutate((state) => {
      state.terrain.skyboxMode = skybox;
    });
  },
});
