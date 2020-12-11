import { App } from "~/core/zustand";
import { theme } from "~/styles/tailwind";

export type SkyboxMode = "day" | "night" | "sunrise" | "sunset";

export type ThreeD = {
  enabled: boolean;
  exageration: number;

  skyColor: string;
  skyboxMode: SkyboxMode;
};

export const threeDInitialState = {
  enabled: false,
  exageration: 150,

  skyColor: theme.colors.blue[800],
  skyboxMode: "day",
};

export const threeD = ({ mutate, get }: App) => ({
  ...threeDInitialState,

  toggle: () => {
    mutate((state) => {
      state.threeD.enabled = !state.threeD.enabled;
    });
  },

  setExageration: (exageration: number) => {
    mutate((state) => {
      state.threeD.exageration = exageration;
    });
  },

  setSkyColor: (skyColor: string) => {
    mutate((state) => {
      state.threeD.skyColor = skyColor;
    });
  },

  setSkybox: (skybox: SkyboxMode) => {
    mutate((state) => {
      state.threeD.skyboxMode = skybox;
    });
  },
});
