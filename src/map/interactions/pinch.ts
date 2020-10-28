import { Position } from "@turf/turf";

type GestureEvent = Event & {
  scale: number;
};

export const applyPinchInteractions = (map: mapboxgl.Map): void => {
  let initialZoom: number | null = null;
  let initialCenter: Position | null = null;
  let cursorPosition: Position | null = null;

  const onGestureStart = (event: Event) => {
    initialZoom = map.getZoom();
    initialCenter = map.getCenter().toArray();

    event.preventDefault();
  };

  const onGesture = (event: Event) => {
    event.preventDefault();

    if (!initialZoom || !cursorPosition || !initialCenter) {
      return;
    }

    const zoom = initialZoom * (event as GestureEvent).scale;

    map.setZoom(zoom);
    // map.setCenter([
    //   initialCenter[0] +
    //     (Math.log(zoom / initialZoom) / Math.log(23 / initialZoom)) * (cursorPosition[0] - initialCenter[0]),
    //   initialCenter[1] +
    //     (Math.log(zoom / initialZoom) / Math.log(23 / initialZoom)) * (cursorPosition[1] - initialCenter[1]),
    // ]);
  };

  const onGestureEnd = (event: Event) => {
    event.preventDefault();
  };

  map.on("mousemove", (event) => {
    cursorPosition = event.lngLat.toArray();
  });

  map.getCanvas().addEventListener("gesturestart", onGestureStart);
  map.getCanvas().addEventListener("gesturechange", onGesture);
  map.getCanvas().addEventListener("gestureend", onGestureEnd);
};
