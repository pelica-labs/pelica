import { App } from "~/core/helpers";

export type Screen = {
  dimensions: ScreenDimensions;
  pixelRatio: number;
};

export type ScreenDimensions = {
  width: number;
  height: number;
};

const initialState: Screen = {
  dimensions: {
    width: 1200,
    height: 800,
  },
  pixelRatio: 1,
};

export const screen = ({ mutate }: App) => ({
  ...initialState,

  initialise: () => {
    mutate((state) => {
      state.screen.dimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      state.screen.pixelRatio = window.devicePixelRatio;
    });
  },

  updateScreen: (width: number, height: number) => {
    mutate((state) => {
      state.screen.dimensions.width = width;
      state.screen.dimensions.height = height;
    });
  },
});
