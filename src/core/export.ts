import { sumBy } from "lodash";

import { getBackgroundMap, getMap } from "~/core/selectors";
import { App } from "~/core/zustand";
import { loadExt } from "~/lib/ext";

type Exports = {
  exporting: boolean;
  videoExport: boolean;
  imageData: string | null;
};

export type EncodingUpdate = {
  status: "idle" | "running" | "complete" | "interrupted";
  framesCount: number;
  totalFrames: number;
};

export const exportsInitialState: Exports = {
  exporting: false,
  videoExport: false,
  imageData: null,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const exports = ({ mutate, get }: App) => ({
  ...exportsInitialState,

  prepareCanvas: () => {
    mutate((state) => {
      state.exports.imageData = null;
      state.exports.exporting = true;
    });
  },

  downloadImage: (imageData: string, fileName: string) => {
    const anchor = document.createElement("a");
    anchor.href = imageData;
    anchor.download = fileName;

    anchor.click();
  },

  generateImage: () => {
    const canvas = getMap(get()).getCanvas();

    mutate((state) => {
      state.exports.imageData = canvas.toDataURL("image/jpeg", 0.9);
      state.exports.exporting = false;
    });
  },

  toggleVideoExport: () => {
    mutate((state) => {
      state.exports.videoExport = !state.exports.videoExport;
    });
  },

  downloadVideo: async (fileName: string, onUpdate: (update: EncodingUpdate) => boolean) => {
    const { loadEncoder } = await loadExt();
    const map = getBackgroundMap();
    const simd = get().platform.system.simd;
    const gl = map.getCanvas().getContext("webgl") as WebGLRenderingContext;
    const width: number = gl.drawingBufferWidth;
    const height: number = gl.drawingBufferHeight;

    let interrupted = false;

    const Encoder = await loadEncoder({ simd });

    const frameRate = 60;
    const encoder = Encoder.create({
      width,
      height,
      fps: frameRate,
      kbps: 64000,
      rgbFlipY: true,
    });

    const ptr = encoder.getRGBPointer();

    let framesCount = 0;
    const sceneLength = sumBy(get().scenes.breakpoints.slice(1), (breakpoint) => {
      return breakpoint.duration || 4000;
    });
    const totalFrames = Math.round(sceneLength / (1000 / frameRate)) + 4;

    const onFrame = () => {
      // console.log(width, height);
      const frame = encoder.memory().subarray(ptr);

      // console.log(frame);

      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, frame);

      encoder.encodeRGBPointer();

      framesCount += 1;

      const keepGoing = onUpdate({ status: "running", framesCount, totalFrames });

      if (!keepGoing) {
        interrupted = true;
      }
    };

    map.on("render", onFrame);

    await get().scenes.play({ background: true, frameRate }, () => !interrupted);

    map.off("render", onFrame);

    const mp4 = encoder.end();

    if (interrupted) {
      onUpdate({ status: "interrupted", framesCount, totalFrames });

      return;
    }

    onUpdate({ status: "complete", framesCount, totalFrames: framesCount });

    if (mp4.length === 156) {
      get().alerts.trigger({
        timeout: 20000,
        color: "red",
        message:
          "We're sorry, something went wrong during the encoding.\nVideo export is still is beta and has known issues when using a custom aspect ratio.",
      });

      return;
    }

    const blob = new Blob([mp4], { type: "video/mp4" });

    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = fileName;

    anchor.click();
  },
});
