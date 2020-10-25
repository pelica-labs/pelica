import { App } from "~/core/helpers";

type Exports = {
  exporting: boolean;
  imageData: string | null;
};

export const exportsInitialState: Exports = {
  exporting: false,
  imageData: null,
};

export const exports = ({ mutate }: App) => ({
  ...exportsInitialState,

  prepareCanvas: () => {
    mutate((state) => {
      state.exports.exporting = true;
    });
  },

  generateImage: () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      throw new Error("Could not fetch canvas");
    }

    mutate((state) => {
      state.exports.imageData = canvas.toDataURL("image/jpeg", 0.9);
      state.exports.exporting = false;
    });
  },
});
