import { createH264MP4Encoder } from "h264-mp4-encoder";

import { getMap } from "~/core/selectors";
import { App } from "~/core/zustand";

type Exports = {
  exporting: boolean;
  imageData: string | null;
};

export const exportsInitialState: Exports = {
  exporting: false,
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

  downloadVideo: async (fileName: string) => {
    const map = getMap();
    const gl = map.painter.context.gl as WebGLRenderingContext;
    const width: number = gl.drawingBufferWidth;
    const height: number = gl.drawingBufferHeight;

    const encoder = await createH264MP4Encoder();

    encoder.width = width;
    encoder.height = height;
    encoder.frameRate = 60;
    encoder.kbps = 64000;
    encoder.speed = 10;
    encoder.debug = true;
    encoder.initialize();

    const onFrame = () => {
      const frame = new Uint8Array(width * height);

      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, frame);
      encoder.addFrameRgba(frame);
    };

    map.on("render", onFrame);

    await get().scenes.play();

    map.off("render", onFrame);

    encoder.finalize();

    const blob = new Blob([encoder.FS.readFile(encoder.outputFilename)], { type: "video/mp4" });

    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = fileName;

    anchor.click();
  },
});
