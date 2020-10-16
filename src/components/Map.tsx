import { bbox, lineString, transformScale } from "@turf/turf";
import { debounce } from "lodash";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { DocumentTitle } from "~/components/DocumentTitle";
import { useApp, useStoreSubscription } from "~/core/app";
import { applyGeometries } from "~/core/geometries";
import { STOP_DRAWING_CIRCLE_ID } from "~/core/routes";
import { computeMapDimensions } from "~/lib/aspectRatio";
import { getEnv } from "~/lib/config";
import { styleToUrl } from "~/lib/style";
import { applyImageMissingHandler } from "~/map/imageMissing";
import { applyInteractions } from "~/map/interactions";
import { applyLayers } from "~/map/layers";
import { applySources, MapSource } from "~/map/sources";

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

    const accessToken = getEnv("NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN", process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN);

    const {
      map: { coordinates, zoom, bearing, pitch },
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

    map.current.on("load", async ({ target: map }) => {
      map.getCanvas().classList.add("loaded");

      map.resize();

      applySources(map);
      applyLayers(map);

      // await app.sync.restoreState();

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
   * Sync state to storage
   */
  useStoreSubscription(
    (store) => store,
    debounce(() => {
      app.sync.saveState();
    }, 1000)
  );

  /**
   * Sync coordinates
   */
  useStoreSubscription(
    (store) => store.map.coordinates,
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
    (store) => store.map.zoom,
    (zoom) => {
      map.current?.zoomTo(zoom);
    }
  );

  /**
   * Sync bearing
   */
  useStoreSubscription(
    (store) => store.map.bearing,
    (bearing) => {
      map.current?.setBearing(bearing);
    }
  );

  /**
   * Sync pitch
   */
  useStoreSubscription(
    (store) => store.map.pitch,
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
    (store) => store.map.place,
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
      editorMode: store.editor.mode,
      geometries: store.geometries.items,
      drawing: store.routes.isDrawing,
      selectedGeometryId: store.selection.selectedGeometryId,
    }),
    ({ editorMode, geometries, drawing, selectedGeometryId }) => {
      if (!map.current) {
        return;
      }

      const selectedGeometry = geometries.find((geometry) => geometry.id === selectedGeometryId);

      const allGeometries = [...geometries];

      if (
        editorMode === "draw" &&
        selectedGeometry?.type === "Line" &&
        !drawing &&
        selectedGeometry.points.length > 0
      ) {
        allGeometries.push({
          id: STOP_DRAWING_CIRCLE_ID,
          type: "Circle",
          source: MapSource.Routes,
          coordinates: selectedGeometry.points[selectedGeometry.points.length - 1],
          style: {
            color: selectedGeometry.style.color,
            width: selectedGeometry.style.width,
          },
        });
      }

      if (editorMode === "select") {
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

      const containerClasses = map.current.getCanvasContainer().classList;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      containerClasses.remove(...containerClasses.values());
      containerClasses.add("mapboxgl-canvas-container");

      if (draggedGeometryId) {
        containerClasses.add("grab");
      } else if ((editorMode === "draw" || editorMode === "pin") && hoveredGeometryId !== STOP_DRAWING_CIRCLE_ID) {
        containerClasses.add("crosshair");
      } else if (hoveredGeometryId) {
        containerClasses.add("pointer");
      }
    }
  );

  /**
   * Sync events
   */
  useEffect(() => {
    if (app.editor.mode === "draw") {
      map.current?.dragPan.disable();
    } else {
      map.current?.dragPan.enable();
    }
  }, [app.editor.mode]);

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <DocumentTitle />
      <div className="flex justify-center items-center w-full h-full bg-gray-200 lg:px-20 lg:py-6">
        <div ref={container} className="w-full h-full flex justify-center items-center">
          <div ref={wrapper} className="w-full h-full shadow-md border border-gray-400" id="map" />
        </div>
      </div>
    </>
  );
};
