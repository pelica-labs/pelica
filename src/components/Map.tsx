import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { computeMapDimensions } from "~/lib/aspectRatio";
import { applyGeometries } from "~/lib/geometry";
import { applyInteractions } from "~/lib/interactions";
import { applyLayers } from "~/lib/layers";
import { styleToUrl } from "~/lib/mapbox";
import { applySources } from "~/lib/sources";
import { getState, useStore, useStoreSubscription } from "~/lib/state";

export const Map: React.FC = () => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const dispatch = useStore((store) => store.dispatch);

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
      applyInteractions(map, dispatch);

      map.getCanvas().style.outline = "none";

      map.on("styledata", () => {
        applySources(map);
        applyLayers(map);
        applyGeometries(map, getState().geometries);
      });
    });
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
      map.current?.resize();
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
    (store) => ({
      editorMode: store.editor.mode,
      altKey: store.keyboard.altKey,
      draggedGeometry: store.draggedGeometry,
    }),
    ({ editorMode, altKey, draggedGeometry }) => {
      if (!map.current) {
        return null;
      }

      const canvasStyle = map.current.getCanvas().style;

      if (altKey) {
        canvasStyle.cursor = "pointer";
      } else if (draggedGeometry) {
        canvasStyle.cursor = "grab";
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
      <div ref={container} className="flex justify-center items-center w-full h-full bg-gray-700 overscroll-none">
        <div ref={wrapper} className="w-full h-full overscroll-none" />
      </div>
    </>
  );
};
