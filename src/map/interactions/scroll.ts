import { MapWheelEvent } from "mapbox-gl";

export const applyScrollInteractions = (map: mapboxgl.Map): void => {
  const onWheel = (event: MapWheelEvent) => {
    const { originalEvent } = event;

    // Shift scroll for horizontal zoom is natively handled.

    // Meta key always triggers the native zoom.
    if (originalEvent.metaKey) {
      return;
    }

    // 🧙‍♂️
    // During a pinch event, the browser thinks CTRL is pressed.
    if (originalEvent.ctrlKey) {
      return;
    }

    const x = originalEvent.deltaX;
    const y = originalEvent.deltaY;

    map.panBy([x, y], { animate: false });

    event.preventDefault();
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
  };

  map.scrollZoom.setZoomRate(0.03);

  map.on("wheel", onWheel);
};
