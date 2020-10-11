export const exports = () => ({
  generateImage: () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      throw new Error("Could not fetch canvas");
    }

    return canvas.toDataURL("image/jpeg", 1);
  },
});
