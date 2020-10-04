import { throttle } from "lodash";
import mapboxgl, { LngLatBoundsLike, MapMouseEvent } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { applyActions } from "~/lib/actions";
import { applyLayers } from "~/lib/layers";
import { styleToUrl } from "~/lib/mapbox";
import { applySources } from "~/lib/sources";
import { getState, useStore, useStoreSubscription } from "~/lib/state";

export const Map: React.FC = () => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const dispatch = useStore((store) => store.dispatch);

  const onMoveEnd = (event: MapMouseEvent) => {
    const { lng, lat } = event.target.getCenter();
    const zoom = event.target.getZoom();

    dispatch.move(lat, lng, zoom);
  };

  const onMouseMove = throttle((event: MapMouseEvent) => {
    const { keyboard, currentBrush } = getState();

    if (keyboard.altKey || !currentBrush) {
      return;
    }

    event.preventDefault();
    dispatch.brush(event.lngLat.lat, event.lngLat.lng);
  }, 1000 / 30);

  const onMouseDown = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey || editor.mode !== "brush") {
      return;
    }

    event.preventDefault();
    dispatch.startBrush();
  };

  const onMouseUp = () => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey || editor.mode !== "brush") {
      return;
    }

    dispatch.endBrush();
  };

  const onClick = (event: MapMouseEvent) => {
    const { keyboard, editor } = getState();

    if (keyboard.altKey) {
      return;
    }

    dispatch.closePanes();

    if (editor.mode === "trace") {
      dispatch.trace(event.lngLat.lat, event.lngLat.lng);
    }

    if (editor.mode === "pin") {
      dispatch.pin(event.lngLat.lat, event.lngLat.lng);
    }
  };

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!container.current) {
      return;
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!accessToken) {
      throw new Error("Missing Mapbox public token");
    }

    const { coordinates, zoom, style } = getState();

    map.current = new mapboxgl.Map({
      accessToken,
      container: container.current,
      style: styleToUrl(style),
      center: [coordinates.longitude, coordinates.latitude],
      zoom,
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

      map.on("styledata", () => {
        applySources(map);
        applyLayers(map);
      });
    });

    return () => {
      map.current?.remove();
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
      } else if (editorMode === "trace" || editorMode === "brush") {
        map.current.dragPan.disable();
        map.current.scrollZoom.disable();
        map.current.touchPitch.disable();
        map.current.touchZoomRotate.disable();
      }
    }
  );

  /**
   * Sync actions
   */
  useStoreSubscription(
    (store) => ({ actions: store.actions, currentBrush: store.currentBrush }),
    ({ actions, currentBrush }) => {
      if (!map.current) {
        return;
      }

      const allActions = [...actions];
      if (currentBrush) {
        allActions.push(currentBrush);
      }

      applyActions(map.current, allActions);
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
      } else if (editorMode === "trace" || editorMode === "brush" || editorMode === "pin") {
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
      <div ref={container} className="w-full h-full" />
    </>
  );
};
