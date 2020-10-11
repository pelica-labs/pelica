import { bbox, lineString, transformScale } from "@turf/turf";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { useApp, useStoreSubscription } from "~/core/app";
import { applyGeometries } from "~/core/geometries";
import { STOP_DRAWING_CIRCLE_ID } from "~/core/line";
import { computeMapDimensions } from "~/lib/aspectRatio";
import { applyImageMissingHandler } from "~/lib/imageMissing";
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
      fadeDuration: 0,
      logoPosition: "bottom-right",
      preserveDrawingBuffer: true,
    });

    map.current.on("load", ({ target: map }) => {
      map.resize();

      applySources(map);
      applyLayers(map);
      applyInteractions(map, app);
      applyImageMissingHandler(map);

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
   * Sync geometries to map
   */
  useStoreSubscription(
    (store) => ({
      geometries: store.geometries.items,
      currentLine: store.line.currentLine,
      drawing: store.line.drawing,
      selectedGeometryId: store.selection.selectedGeometryId,
    }),
    ({ geometries, currentLine, drawing, selectedGeometryId }) => {
      if (!map.current) {
        return;
      }
      const allGeometries = [...geometries];

      if (currentLine) {
        allGeometries.push(currentLine);

        if (!drawing && currentLine.points.length > 1) {
          allGeometries.push({
            id: STOP_DRAWING_CIRCLE_ID,
            type: "Circle",
            source: MapSource.Routes,
            coordinates: currentLine.points[currentLine.points.length - 1],
            style: {
              color: currentLine.style.color,
              width: currentLine.style.width,
            },
          });
        }
      }

      const selectedGeometry = geometries.find((geometry) => geometry.id === selectedGeometryId);

      if (selectedGeometry?.type === "Line") {
        const box = bbox(
          transformScale(
            lineString(
              selectedGeometry.points.map((point) => {
                return [point.longitude, point.latitude];
              })
            ),
            1.05 + 0.01 * selectedGeometry.style.width
          )
        );

        allGeometries.push({
          id: -1,
          type: "Rectangle",
          source: MapSource.Overlays,
          box: {
            northWest: { longitude: box[0], latitude: box[1] },
            southEast: { longitude: box[2], latitude: box[3] },
          },
        });
      }

      if (selectedGeometry?.type === "Point") {
        allGeometries.push({
          id: -1,
          type: "Circle",
          source: MapSource.Overlays,
          coordinates: selectedGeometry.coordinates,
        });
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
      draggedGeometryId: store.dragAndDrop.draggedGeometryId,
      hoveredGeometryId: store.dragAndDrop.hoveredGeometryId,
    }),
    ({ editorMode, draggedGeometryId, hoveredGeometryId }) => {
      if (!map.current) {
        return null;
      }

      const canvasStyle = map.current.getCanvas().style;

      if (draggedGeometryId) {
        canvasStyle.cursor = "grab";
      } else if ((editorMode === "draw" || editorMode === "pin") && hoveredGeometryId !== STOP_DRAWING_CIRCLE_ID) {
        canvasStyle.cursor = "crosshair";
      } else if (hoveredGeometryId) {
        canvasStyle.cursor = "pointer";
      } else if (editorMode === "move") {
        canvasStyle.cursor = "default";
      }
    }
  );

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={container} className="flex justify-center items-center w-full h-full p-1 bg-gray-700">
        <div ref={wrapper} className="w-full h-full shadow" />
      </div>
    </>
  );
};
