import { App } from "~/core/helpers";
import { theme } from "~/styles/tailwind";

export type Screen = {
  dimensions: ScreenDimensions;

  touch: boolean;

  pixelRatio: number;
};

export type ScreenDimensions = {
  width: number;
  height: number;
  xl: boolean;
  md: boolean;
  lg: boolean;
  sm: boolean;
};

const initialState: Screen = {
  dimensions: {
    width: 1200,
    height: 800,
    xl: false,
    lg: true,
    md: true,
    sm: true,
  },

  touch: false,

  pixelRatio: 1,
};

export const screen = ({ mutate, get }: App) => ({
  ...initialState,

  initialize: () => {
    get().screen.updateScreen(window.innerWidth, window.innerHeight);

    mutate((state) => {
      state.screen.pixelRatio = window.devicePixelRatio;
    });
  },

  updateScreen: (width: number, height: number) => {
    mutate((state) => {
      state.screen.dimensions.width = width;
      state.screen.dimensions.height = height;

      state.screen.dimensions.xl = width >= parseInt(theme.screens.xl);
      state.screen.dimensions.lg = width >= parseInt(theme.screens.lg);
      state.screen.dimensions.md = width >= parseInt(theme.screens.md);
      state.screen.dimensions.sm = width >= parseInt(theme.screens.sm);

      state.screen.touch = "ontouchstart" in document.documentElement;
    });
  },
});
