import { bbox, circle, lineString, transformScale } from "@turf/turf";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { useApp, useStoreSubscription } from "~/core/app";
import { computeMapDimensions } from "~/lib/aspectRatio";
import { applyGeometries, nextGeometryId } from "~/lib/geometry";
import { applyInteractions } from "~/lib/interactions";
import { applyLayers } from "~/lib/layers";
import { applySources, MapSource } from "~/lib/sources";
import { styleToUrl } from "~/lib/style";

export const Map: React.FC = () => {
  const app = useApp();
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

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

    const {
      mapView: { coordinates, zoom, bearing, pitch },
      editor: { style },
      geometries,
    } = app;

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
      applyInteractions(map, app);

      map.getCanvas().style.outline = "none";

      map.on("styledata", () => {
        applySources(map);
        applyLayers(map);
        applyGeometries(map, geometries.items);
      });
    });
  }, []);

  /**
   * Sync coordinates
   */
  useStoreSubscription(
    (store) => store.mapView.coordinates,
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
    (store) => store.mapView.zoom,
    (zoom) => {
      map.current?.zoomTo(zoom);
    }
  );

  /**
   * Sync bearing
   */
  useStoreSubscription(
    (store) => store.mapView.bearing,
    (bearing) => {
      map.current?.setBearing(bearing);
    }
  );

  /**
   * Sync pitch
   */
  useStoreSubscription(
    (store) => store.mapView.pitch,
    (pitch) => {
      map.current?.setPitch(pitch);
    }
  );

  /**
   * Handle aspect ratio & resize
   */
  useStoreSubscription(
    (store) => ({ aspectRatio: store.editor.aspectRatio, screen: store.screen }),
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
    (store) => store.mapView.place,
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
    (store) => store.editor.style,
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
    (store) => ({ actions: store.history.actions, currentDraw: store.line.currentDraw }),
    () => {
      app.history.applyActions();
    }
  );

  /**
   * Sync geometries to map
   */
  useStoreSubscription(
    (store) => ({
      geometries: store.geometries.items,
      selectedGeometryId: store.selection.selectedGeometryId,
      zoom: store.mapView.zoom,
    }),
    ({ geometries, selectedGeometryId, zoom }) => {
      if (!map.current) {
        return;
      }

      const allGeometries = [...geometries];

      const selectedGeometry = geometries.find((geometry) => geometry.id === selectedGeometryId);

      if (selectedGeometry?.type === "PolyLine") {
        const box = bbox(
          transformScale(
            lineString(
              selectedGeometry.points.map((point) => {
                return [point.longitude, point.latitude];
              })
            ),
            1.05
          )
        );

        allGeometries.push({
          id: nextGeometryId(),
          type: "Rectangle",
          source: MapSource.Overlays,
          box: {
            northWest: { longitude: box[0], latitude: box[1] },
            southEast: { longitude: box[2], latitude: box[3] },
          },
        });
      }

      if (selectedGeometry?.type === "Point") {
        const radius = 2 ** (-zoom - 1);
        const polygon = circle(
          [selectedGeometry.coordinates.longitude, selectedGeometry.coordinates.latitude],
          radius * selectedGeometry.style.strokeWidth * 150,
          {
            steps: 20,
            units: "kilometers",
          }
        );

        if (polygon.geometry) {
          allGeometries.push({
            id: nextGeometryId(),
            type: "Polygon",
            source: MapSource.Overlays,
            lines: polygon.geometry.coordinates.map((points) => {
              return points.map((point) => {
                return { longitude: point[0], latitude: point[1] };
              });
            }),
          });
        }
      }

      applyGeometries(map.current, allGeometries);
    }
  );

  /**
   * Sync cursor
   */
  useStoreSubscription(
    (store) => ({
      editorMode: store.editor.mode,
      altKey: store.keyboard.altKey,
      draggedGeometryId: store.dragAndDrop.draggedGeometryId,
    }),
    ({ editorMode, altKey, draggedGeometryId }) => {
      if (!map.current) {
        return null;
      }

      const canvasStyle = map.current.getCanvas().style;

      if (altKey) {
        canvasStyle.cursor = "pointer";
      } else if (draggedGeometryId) {
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
