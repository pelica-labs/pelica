import { distance, Position } from "@turf/turf";
import BezierEasing from "bezier-easing";
import { Promise } from "bluebird";

import { getMap } from "~/core/selectors";
import { App } from "~/core/zustand";
import { sleep } from "~/lib/promise";

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
export const scenes = ({ mutate, get }: App) => ({
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

  play: async () => {
    const map = getMap(get());
    const breakpoints = get().scenes.breakpoints;
    const [start] = breakpoints;

    if (!start) {
      return;
    }

    map.setCenter(start.coordinates as [number, number]);
    map.setZoom(start.zoom);
    map.setBearing(start.bearing);
    map.setPitch(start.pitch);

    await sleep(1000);

    await Promise.each(breakpoints, async (breakpoint, index) => {
      if (index === 0) {
        return;
      }

      const distanceToBreakpoint = distance(breakpoints[index - 1].coordinates, breakpoint.coordinates, {
        units: "kilometers",
      });

      map.flyTo({
        center: breakpoint.coordinates as [number, number],
        zoom: breakpoint.zoom,
        bearing: breakpoint.bearing,
        pitch: breakpoint.pitch,
        animate: true,
        essential: true,
        duration: Math.max(4000, distanceToBreakpoint * 40),
        easing: BezierEasing(0.42, 0.0, 0.58, 1.0), // ease-in-out
      });

      await new Promise((resolve) => {
        map.once("moveend", () => {
          resolve();
        });
      });
    });
  },
});
