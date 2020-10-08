import { App } from "~/core/helpers";
import { isServer } from "~/lib/ssr";

export type Screen = {
  dimensions: ScreenDimensions;
};

export type ScreenDimensions = {
  width: number;
  height: number;
};

const initialState: Screen = {
  dimensions: {
    width: isServer ? 1200 : window.innerWidth,
    height: isServer ? 800 : window.innerHeight,
  },
};

export const screen = ({ mutate }: App) => ({
  ...initialState,

  updateScreen: (width: number, height: number) => {
    mutate(({ screen }) => {
      screen.dimensions.width = width;
      screen.dimensions.height = height;
    });
  },
});
