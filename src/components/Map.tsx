import { throttle } from "lodash";
import mapboxgl, { LngLatBoundsLike, MapLayerMouseEvent, MapMouseEvent } from "mapbox-gl";
import Head from "next/head";
import React, { CSSProperties, useEffect, useRef } from "react";

import { applyGeometries, Position } from "~/lib/geometry";
import { applyLayers } from "~/lib/layers";
import { styleToUrl } from "~/lib/mapbox";
import { applySources, MapSource } from "~/lib/sources";
import { AspectRatio, getState, ScreenDimensions, useStore, useStoreSubscription } from "~/lib/state";

function computeMapDimensions(aspectRatio: AspectRatio, screen: ScreenDimensions): CSSProperties {
  if (aspectRatio === "fill") {
    return {
      width: "100%",
      height: "100%",
      maxHeight: "none",
      maxWidth: "none",
    };
  }

  if (aspectRatio === "square") {
    const smallestDimension = Math.min(screen.width, screen.height);

    return {
      maxWidth: `${smallestDimension}px`,
      maxHeight: `${smallestDimension}px`,
    };
  }

  throw new Error("Unknown aspect ratio");
}

export const Map: React.FC = () => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const dispatch = useStore((store) => store.dispatch);

  const onMoveEnd = (event: MapMouseEvent) => {
    const { lng, lat } = event.target.getCenter();
    const zoom = event.target.getZoom();
    const bearing = event.target.getBearing();
    const pitch = event.target.getPitch();

    dispatch.move(lat, lng, zoom, bearing, pitch);
  };

  const onMouseMove = throttle((event: MapMouseEvent) => {
    const { keyboard, currentDraw } = getState();

    if (keyboard.altKey || !currentDraw) {
      return;
    }

    event.preventDefault();
    dispatch.draw(event.lngLat.lat, event.lngLat.lng);
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey || editor.mode !== "draw") {
      return;
    }

    event.preventDefault();
    dispatch.startDrawing();
  };

  const onMouseUp = () => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey || editor.mode !== "draw") {
      return;
    }

    dispatch.endDrawing();
  };

  const onClick = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey) {
      return;
    }

    dispatch.closePanes();

    if (editor.mode === "pin") {
      dispatch.pin(event.lngLat.lat, event.lngLat.lng);
    }
  };

  const onRouteClick = (event: MapLayerMouseEvent) => {
    const { editor } = getState();

    if (editor.mode !== "move") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    dispatch.selectPin(event.features[0]);
  };

  const onWindowBlur = () => {
    onMouseUp();
  };

  const onWindowKeyUp = (event: KeyboardEvent) => {
    const { selectedPin } = getState();

    if (!selectedPin) {
      return;
    }

    const coefficient = event.shiftKey ? 0.1 : 0.01;

    const keyCodeToDirection: { [key: number]: Position } = {
      37: { x: -coefficient, y: 0 }, // left
      38: { x: 0, y: -coefficient }, // top
      39: { x: coefficient, y: 0 }, // right
      40: { x: 0, y: coefficient }, // down
    };

    if (keyCodeToDirection[event.keyCode]) {
      event.preventDefault();
      event.stopPropagation();

      dispatch.moveSelectedPin(keyCodeToDirection[event.keyCode]);
    }
  };

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!wrapper.current) {
      return;
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!accessToken) {
      throw new Error("Missing Mapbox public token");
    }

    const { coordinates, zoom, style, bearing, pitch } = getState();

    map.current = new mapboxgl.Map({
      accessToken,
      container: wrapper.current,
      style: styleToUrl(style),
      center: [coordinates.longitude, coordinates.latitude],
      zoom,
      bearing,
      pitch,
      logoPosition: "bottom-right",
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    map.current.on("load", ({ target: map }) => {
      applySources(map);
      applyLayers(map);

      map.on("moveend", onMoveEnd);
      map.on("mousemove", onMouseMove);
      map.on("mousedown", onMouseDown);
      map.on("mouseup", onMouseUp);
      map.on("touchmove", onMouseMove);
      map.on("touchstart", onMouseDown);
      map.on("touchend", onMouseUp);
      map.on("click", onClick);
      map.on("click", MapSource.Pins, onRouteClick);

      map.on("styledata", () => {
        applySources(map);
        applyLayers(map);
        applyGeometries(map, getState().geometries);
      });

      window.addEventListener("blur", onWindowBlur, false);

      map.getCanvas().addEventListener("keydown", onWindowKeyUp, false);
    });

    return () => {
      if (!map.current) {
        return;
      }

      map.current.remove();

      window.removeEventListener("blur", onWindowBlur, false);
      map.current.getCanvas().removeEventListener("keydown", onWindowKeyUp, false);
    };
  }, []);

  /**
   * Sync coordinates
   */
  useStoreSubscription(
    (store) => store.coordinates,
    (coordinates) => {
      map.current?.flyTo({
        center: {
          lng: coordinates.longitude,
          lat: coordinates.latitude,
        },
      });
    }
  );

  /**
   * Sync zoom
   */
  useStoreSubscription(
    (store) => store.zoom,
    (zoom) => {
      map.current?.zoomTo(zoom);
    }
  );

  /**
   * Sync bearing
   */
  useStoreSubscription(
    (store) => store.bearing,
    (bearing) => {
      map.current?.setBearing(bearing);
    }
  );

  /**
   * Sync pitch
   */
  useStoreSubscription(
    (store) => store.pitch,
    (pitch) => {
      map.current?.setPitch(pitch);
    }
  );

  /**
   * Handle aspect ratio & resize
   */
  useStoreSubscription(
    (store) => ({ aspectRatio: store.aspectRatio, screen: store.screen }),
    ({ aspectRatio }) => {
      const canvas = map.current?.getCanvas();
      if (!canvas || !wrapper.current || !container.current) {
        return;
      }

      Object.assign(
        wrapper.current.style,
        computeMapDimensions(aspectRatio, {
          width: container.current.clientWidth,
          height: container.current.clientHeight,
        })
      );

      canvas.style.width = "100%";
      canvas.style.height = "100%";

      setTimeout(() => {
        map.current?.resize();
      });
    }
  );

  /**
   * Sync place
   */
  useStoreSubscription(
    (store) => store.place,
    (place) => {
      if (!place) {
        return;
      }

      if (place.bbox) {
        map.current?.fitBounds(place.bbox as LngLatBoundsLike, { padding: 10 });
      } else {
        map.current?.flyTo({
          center: {
            lng: place.center[0],
            lat: place.center[1],
          },
          zoom: 14,
        });
      }
    }
  );

  /**
   * Sync style
   */
  useStoreSubscription(
    (store) => store.style,
    (style) => {
      if (!style) {
        return;
      }

      map.current?.setStyle(styleToUrl(style));
    }
  );

  /**
   * Sync map interactivity
   */
  useStoreSubscription(
    (store) => ({ editorMode: store.editor.mode, altKey: store.keyboard.altKey }),
    ({ editorMode, altKey }) => {
      if (!map.current) {
        return;
      }

      if (editorMode === "move" || altKey) {
        map.current.dragPan.enable();
        map.current.scrollZoom.enable();
        map.current.touchPitch.enable();
        map.current.touchZoomRotate.enable();
      } else if (editorMode === "draw") {
        map.current.dragPan.disable();
        map.current.scrollZoom.disable();
        map.current.touchPitch.disable();
        map.current.touchZoomRotate.disable();
      }
    }
  );

  /**
   * Sync actions to state
   */
  useStoreSubscription(
    (store) => ({ actions: store.actions, currentDraw: store.currentDraw }),
    () => {
      dispatch.applyActions();
    }
  );

  /**
   * Sync geometries to map
   */
  useStoreSubscription(
    (store) => store.geometries,
    (geometries) => {
      if (!map.current) {
        return;
      }

      applyGeometries(map.current, geometries);
    }
  );

  /**
   * Sync cursor
   */
  useStoreSubscription(
    (store) => ({ editorMode: store.editor.mode, altKey: store.keyboard.altKey }),
    ({ editorMode, altKey }) => {
      if (!map.current) {
        return null;
      }

      const canvasStyle = map.current.getCanvas().style;

      if (altKey) {
        canvasStyle.cursor = "pointer";
      } else if (editorMode === "draw" || editorMode === "pin") {
        canvasStyle.cursor = "crosshair";
      } else if (editorMode === "move") {
        canvasStyle.cursor = "pointer";
      }
    }
  );

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={container} className="flex justify-center items-center w-full h-full bg-gray-700">
        <div ref={wrapper} className="w-full h-full" />
      </div>
    </>
  );
};
