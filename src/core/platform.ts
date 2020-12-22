import { App } from "~/core/zustand";
import { loadExt } from "~/lib/ext";
import { theme } from "~/styles/tailwind";

export type Platform = {
  screen: Screen;
  keyboard: Keyboard;
  system: System;
};

export type Screen = {
  dimensions: ScreenDimensions;

  touch: boolean;

  pixelRatio: number;
};

export type Keyboard = {
  available: boolean;

  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

export type System = {
  appleLike: boolean;
  simd: boolean;
};

export type ScreenDimensions = {
  width: number;
  height: number;
  xl: boolean;
  md: boolean;
  lg: boolean;
  sm: boolean;
};

export const platformInitialState: Platform = {
  screen: {
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
  },

  keyboard: {
    available: true,

    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
  },

  system: {
    appleLike: false,
    simd: false,
  },
};

export const upscale = (pixelRatio: number): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.devicePixelRatio = pixelRatio;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const platform = ({ mutate, get }: App) => ({
  ...platformInitialState,

  initialize: async () => {
    get().platform.updateScreen(window.innerWidth, window.innerHeight);

    mutate((state) => {
      state.platform.screen.pixelRatio = window.devicePixelRatio;

      // @todo: this doesn't work for touch screens with keyboards (e.g: Surface)
      state.platform.keyboard.available = !("ontouchstart" in document.documentElement);

      state.platform.system.appleLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    });

    get().platform.detectSimd();
  },

  detectSimd: async () => {
    const { simd } = await loadExt();
    const supportsSimd = await simd();

    mutate((state) => {
      console.log(supportsSimd);
    });
  },

  updateKeyboard: (event: Partial<Keyboard>) => {
    mutate((state) => {
      Object.assign(state.platform.keyboard, event);
    });
  },

  updateScreen: (width: number, height: number) => {
    mutate((state) => {
      state.platform.screen.dimensions.width = width;
      state.platform.screen.dimensions.height = height;

      state.platform.screen.dimensions.xl = width >= parseInt(theme.screens.xl);
      state.platform.screen.dimensions.lg = width >= parseInt(theme.screens.lg);
      state.platform.screen.dimensions.md = width >= parseInt(theme.screens.md);
      state.platform.screen.dimensions.sm = width >= parseInt(theme.screens.sm);

      state.platform.screen.touch = "ontouchstart" in document.documentElement;
    });
  },
});
