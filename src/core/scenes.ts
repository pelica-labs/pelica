import { Position } from "@turf/turf";

import { App } from "~/core/zustand";

export type Breakpoint = {
  id: string;
  name: string;
  coordinates: Position;
  zoom: number;
  bearing: number;
  pitch: number;
};

export type Scenes = {
  breakpoints: Breakpoint[];
};

export const scenesInitialState: Scenes = {
  breakpoints: [],
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const scenes = ({ mutate }: App) => ({
  ...scenesInitialState,

  addBreakpoint: (breakpoint: Breakpoint) => {
    mutate((state) => {
      state.scenes.breakpoints.push(breakpoint);
    });
  },

  moveBreakpoint: (from: number, to: number) => {
    mutate((state) => {
      const [breakpoint] = state.scenes.breakpoints.splice(from, 1);
      state.scenes.breakpoints.splice(to, 0, breakpoint);
    });
  },

  deleteBreakpoint: (breakpoint: Breakpoint) => {
    mutate((state) => {
      const index = state.scenes.breakpoints.findIndex((item) => item.id === breakpoint.id);

      state.scenes.breakpoints.splice(index, 1);
    });
  },
});
