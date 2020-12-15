import { distance, Position } from "@turf/turf";
import { Promise } from "bluebird";
import { get as lodashGet } from "lodash";
import { FreeCameraOptions, MercatorCoordinate } from "mapbox-gl";

import { getMap } from "~/core/selectors";
import { App } from "~/core/zustand";
import { sleep } from "~/lib/promise";

export type Breakpoint = {
  id: string;
  name: string;
  coordinates: Position;
  position: { x: number; y: number; z: number }; // x, y, z in mercator coordinates
  orientation: number[]; // orientation quaternion
  zoom: number;
  bearing: number;
  pitch: number;
  duration: number | null;
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

  setBreakpointDuration: (id: string, duration: number | null) => {
    mutate((state) => {
      const breakpoint = state.scenes.breakpoints.find((b) => b.id === id);
      if (!breakpoint) {
        return;
      }
      breakpoint.duration = duration;
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

    const basis = (v0: number, v1: number, v2: number, v3: number, t: number) => {
      const t2 = t * t,
        t3 = t2 * t;
      return (
        ((1 - 3 * t + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6
      );
    };

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

      const from = breakpoints[index - 1];
      const to = breakpoint;

      const distanceToBreakpoint = distance(from.coordinates, to.coordinates, {
        units: "kilometers",
      });
      const duration = to.duration || Math.max(4000, distanceToBreakpoint * 40);

      function interpolateBasis(accessor: string) {
        const n = breakpoints.length - 1;
        const v1 = lodashGet(breakpoints[index - 1], accessor),
          v2 = lodashGet(breakpoints[index], accessor),
          v0 = index > 1 ? lodashGet(breakpoints[index - 2], accessor) : 2 * v1 - v2,
          v3 = index < n ? lodashGet(breakpoints[index + 1], accessor) : 2 * v2 - v1;
        return function (t: number) {
          return basis(v0, v1, v2, v3, t);
        };
      }

      const interpolateX = interpolateBasis("position.x");
      const interpolateY = interpolateBasis("position.y");
      const interpolateZ = interpolateBasis("position.z");
      const interpolateO0 = interpolateBasis("orientation[0]");
      const interpolateO1 = interpolateBasis("orientation[1]");
      const interpolateO2 = interpolateBasis("orientation[2]");
      const interpolateO3 = interpolateBasis("orientation[3]");

      await new Promise((resolve) => {
        let lastTime = 0.0;
        let animationTime = 0;

        const frame = (time: number) => {
          if (animationTime < duration) {
            const phase = animationTime / duration;
            const x = interpolateX(phase);
            const y = interpolateY(phase);
            const z = interpolateZ(phase);
            const orientation = [
              interpolateO0(phase),
              interpolateO1(phase),
              interpolateO2(phase),
              interpolateO3(phase),
            ];
            const position = new MercatorCoordinate(x, y, z);

            // mapbox types are broken
            map.setFreeCameraOptions(({ position, orientation } as unknown) as FreeCameraOptions);
            animationTime += 1000 / (time - lastTime);
            lastTime = time;
            window.requestAnimationFrame(frame);
          } else {
            return resolve();
          }
        };

        window.requestAnimationFrame(frame);
      });
    });
  },
});
