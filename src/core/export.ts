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

  download: (imageData: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = fileName;

    a.click();
  },

  generateImage: () => {
    const canvas = getMap(get()).getCanvas();

    mutate((state) => {
      state.exports.imageData = canvas.toDataURL("image/jpeg", 0.9);
      state.exports.exporting = false;
    });
  },
});
