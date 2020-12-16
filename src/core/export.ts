import { getMap } from "~/core/selectors";
import { App } from "~/core/zustand";
import { loadExt } from "~/lib/ext";

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
    const { loadEncoder } = await loadExt();
    const map = getMap();
    const simd = get().platform.system.simd;
    const gl = map.getCanvas().getContext("webgl") as WebGLRenderingContext;
    const width: number = gl.drawingBufferWidth;
    const height: number = gl.drawingBufferHeight;

    const Encoder = await loadEncoder({ simd });

    const encoder = Encoder.create({
      width,
      height,
      fps: 30,
      kbps: 16000,
      rgbFlipY: true,
    });

    const ptr = encoder.getRGBPointer();

    const onFrame = () => {
      const pixels = encoder.memory().subarray(ptr);

      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      encoder.encodeRGBPointer();
    };

    map.on("render", onFrame);

    await get().scenes.play();

    map.off("render", onFrame);

    const mp4 = encoder.end();

    const blob = new Blob([mp4], { type: "video/mp4" });

    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = fileName;

    anchor.click();
  },
});
