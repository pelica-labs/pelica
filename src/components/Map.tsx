import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import mapboxgl, { LngLatBoundsLike, MapLayerMouseEvent, MapLayerTouchEvent, MapMouseEvent } from "mapbox-gl";
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
    const { keyboard, currentDraw, draggedGeometry } = getState();

    if (keyboard.altKey) {
      return;
    }

    event.preventDefault();

    const { lat, lng } = event.lngLat;

    if (currentDraw) {
      dispatch.draw(lat, lng);
    }

    if (draggedGeometry?.type === "Point") {
      dispatch.dragSelectedPin({ latitude: lat, longitude: lng });
    }
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (event.originalEvent.which !== 1) {
      return;
    }

    if (keyboard.altKey || editor.mode !== "draw") {
      return;
    }

    event.preventDefault();
    dispatch.startDrawing();
  };

  const onMouseUp = (event: MapMouseEvent) => {
    const { keyboard, editor, draggedGeometry } = getState();

    if (keyboard.altKey) {
      return;
    }

    if (editor.mode === "draw") {
      dispatch.endDrawing();
    }

    if (draggedGeometry) {
      const { lat, lng } = event.lngLat;

      dispatch.endDragSelectedPin({ latitude: lat, longitude: lng });
    }
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

  const onFeatureClick = (event: MapLayerMouseEvent) => {
    const { editor } = getState();

    if (editor.mode !== "move") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    dispatch.selectGeometry(event.features[0]);
  };

  const onFeatureRightClick = (event: MapLayerMouseEvent) => {
    if (!event.features?.length) {
      return;
    }

    dispatch.setEditorMode("move");
    dispatch.selectGeometry(event.features[0]);
  };

  const onFeatureMouseDown = (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
    const { editor } = getState();

    if (editor.mode !== "move") {
      return;
    }

    if (!event.features?.length) {
      return;
    }

    event.preventDefault();

    dispatch.startDrag(event.features[0]);
  };

  const onWindowBlur = () => {
    onMouseUp();
  };

  const onWindowKeyUp = (event: KeyboardEvent) => {
    const { selectedGeometry } = getState();

    if (!selectedGeometry) {
      return;
    }

    const coefficient = event.shiftKey ? 0.1 : 0.01;

    const keyCodeToDirection: { [key: number]: Position } = {
      [KeyCode.KEY_LEFT]: { x: -coefficient, y: 0 },
      [KeyCode.KEY_UP]: { x: 0, y: -coefficient },
      [KeyCode.KEY_RIGHT]: { x: coefficient, y: 0 },
      [KeyCode.KEY_DOWN]: { x: 0, y: coefficient },
    };

    if (keyCodeToDirection[event.keyCode] && selectedGeometry.type === "Point") {
      event.preventDefault();
      event.stopPropagation();

      dispatch.moveSelectedPin(keyCodeToDirection[event.keyCode]);
    }

    if (event.keyCode === KeyCode.KEY_BACK_SPACE) {
      event.preventDefault();
      event.stopPropagation();

      dispatch.deleteSelectedGeometry();
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
      map.on("click", MapSource.Pins, onFeatureClick);
      map.on("click", MapSource.Routes, onFeatureClick);
      map.on("contextmenu", MapSource.Pins, onFeatureRightClick);
      map.on("contextmenu", MapSource.Routes, onFeatureRightClick);

      map.on("mousedown", MapSource.Pins, onFeatureMouseDown);
      map.on("touchstart", MapSource.Pins, onFeatureMouseDown);

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
