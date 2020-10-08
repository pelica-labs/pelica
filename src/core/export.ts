export const exports = () => ({
  downloadImage: () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "pelica";
    a.click();
  },

  downloadGpx: () => {
    // const routes = get().routes;
    // if (!routes.length) {
    //   return;
    // }
    // const gpx = generateGpx(routes);
    // const a = document.createElement("a");
    // a.href = "data:application/gpx+xml," + encodeURIComponent(gpx);
    // a.download = "pelica.gpx";
    // a.click();
  },
});
