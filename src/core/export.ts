import { App } from "~/core/helpers";
import { getMap } from "~/core/selectors";

type Exports = {
  exporting: boolean;
  imageData: string | null;
};

export const exportsInitialState: Exports = {
  exporting: false,
  imageData: null,
};

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
