import { Position } from "@turf/turf";

import { getMap } from "~/core/selectors";

type GestureEvent = Event & {
  scale: number;
  rotation: number;
};

export const applyPinchInteractions = (): void => {
  const map = getMap();

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

    const { scale } = event as GestureEvent;

    const zoom = initialZoom * scale;

    // @todo find a way to recenter the map
    map.setZoom(zoom);
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
