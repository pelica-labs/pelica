import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { throttle } from "lodash";
import mapboxgl, { LngLatBoundsLike, MapMouseEvent } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { applyActions } from "~/lib/actions";
import { applyLayers } from "~/lib/layers";
import { styleToUrl } from "~/lib/mapbox";
import { applySources } from "~/lib/sources";
import { getState, useStore, useStoreSubscription } from "~/lib/state";

type Props = {
  style?: Style;
  disableSync?: boolean;
  disableInteractions?: boolean;
};

export const Map: React.FC<Props> = ({ style, disableInteractions = false, disableSync = false }) => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const dispatch = useStore((store) => store.dispatch);

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

    const { coordinates, zoom } = getState();

    map.current = new mapboxgl.Map({
      accessToken,
      container: container.current,
      style: style ? styleToUrl(style) : "mapbox://styles/mapbox/streets-v11",
      center: [coordinates.longitude, coordinates.latitude],
      zoom,
      logoPosition: "bottom-right",
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    map.current.on("load", ({ target: map }) => {
      if (disableInteractions) {
        map.dragPan.disable();
        map.scrollZoom.disable();
      }

      if (!disableInteractions) {
        applySources(map);
        applyLayers(map);

        map.on("styledata", () => {
          applySources(map);
          applyLayers(map);
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  /**
   * Sync interactions
   */
  useEffect(() => {
    if (disableInteractions) {
      return;
    }

    const onMoveEnd = (event: MapMouseEvent) => {
      const { lng, lat } = event.target.getCenter();
      const zoom = event.target.getZoom();

      dispatch.move(lat, lng, zoom);
    };

    const onMouseMove = throttle((event: MapMouseEvent) => {
      const { keyboard, editor } = getState();

      if (keyboard.altKey) {
        return;
      }

      if (!editor.isPainting) {
        return;
      }

      dispatch.brush(event.lngLat.lat, event.lngLat.lng);
    }, 1000 / 30);

    const onMouseDown = () => {
      const { keyboard, editor } = getState();

      if (keyboard.altKey) {
        return;
      }

      if (editor.mode === "brush") {
        dispatch.startBrush();
      }
    };

    const onMouseUp = () => {
      const { keyboard, editor } = getState();

      if (keyboard.altKey) {
        return;
      }

      if (editor.mode === "brush") {
        dispatch.endBrush();
      }
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

    map.current?.on("moveend", onMoveEnd);
    map.current?.on("mousemove", onMouseMove);
    map.current?.on("mousedown", onMouseDown);
    map.current?.on("mouseup", onMouseUp);
    map.current?.on("click", onClick);

    return () => {
      map.current?.off("moveend", onMoveEnd);
      map.current?.off("mousemove", onMouseMove);
      map.current?.off("mousedown", onMouseDown);
      map.current?.off("mouseup", onMouseUp);
      map.current?.off("click", onClick);
    };
  }, []);

  /**
   * Sync coordinates
   */
  useStoreSubscription(
    (store) => store.coordinates,
    (coordinates) => {
      if (!coordinates || disableSync) {
        return;
      }

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
      if (!zoom || disableSync) {
        return;
      }

      map.current?.zoomTo(zoom);
    }
  );

  /**
   * Sync place
   */
  useStoreSubscription(
    (store) => store.place,
    (place) => {
      if (!place || disableSync) {
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
      if (!style || disableSync) {
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
      } else if (editorMode === "trace" || editorMode === "brush") {
        map.current.dragPan.disable();
        map.current.scrollZoom.disable();
      }
    }
  );

  /**
   * Sync actions
   */
  useStoreSubscription(
    (store) => ({ actions: store.actions, currentBrush: store.currentBrush }),
    (state) => {
      if (!state || !map.current) {
        return;
      }

      const allActions = [...state.actions];
      if (state.currentBrush) {
        allActions.push(state.currentBrush);
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
      if (!map.current || disableInteractions) {
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
