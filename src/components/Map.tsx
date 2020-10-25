import { featureCollection } from "@turf/turf";
import classNames from "classnames";
import { debounce } from "lodash";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { Clipboard } from "~/components/Clipboard";
import { DocumentTitle } from "~/components/DocumentTitle";
import { ErrorIcon, WarningIcon } from "~/components/Icon";
import { getState, useApp, useStore, useStoreSubscription } from "~/core/app";
import {
  getNextPointOverlay,
  getPinOverlay,
  getRouteOverlay,
  getRouteStopOverlay,
  getSelectionAreaOverlay,
  getWatermarkOverlay,
} from "~/core/overlays";
import { STOP_DRAWING_CIRCLE_ID } from "~/core/routes";
import { getEntityFeatures, getSelectedEntities, getSelectedEntity } from "~/core/selectors";
import { computeMapDimensions, computeResizingRatio } from "~/lib/aspectRatio";
import { getEnv } from "~/lib/config";
import { styleToUrl } from "~/lib/style";
import { applyFeatures, parseFeatures, RawFeature } from "~/map/features";
import { applyImageMissingHandler } from "~/map/imageMissing";
import { applyInteractions } from "~/map/interactions";
import { applyLayers } from "~/map/layers";
import { applySources, MapSource } from "~/map/sources";

export const Map: React.FC = () => {
  const app = useApp();
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const aspectRatio = useStore((state) => state.editor.aspectRatio);

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!wrapper.current) {
      return;
    }

    app.platform.initialize();

    const state = getState();
    const accessToken = getEnv("NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN", process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN);

    map.current = new mapboxgl.Map({
      accessToken,
      container: wrapper.current,
      style: styleToUrl(state.editor.style),
      center: state.map.coordinates as [number, number],
      zoom: state.map.zoom,
      bearing: state.map.bearing,
      pitch: state.map.pitch,
      doubleClickZoom: false,
      fadeDuration: 0,
      logoPosition: app.platform.screen.dimensions.md ? "bottom-right" : "bottom-left",
      preserveDrawingBuffer: true,
    });

    map.current.on("load", async ({ target: map }) => {
      map.getCanvas().classList.add("loaded");
      map.getCanvas().style.outline = "none";
      map.getCanvas().focus();

      map.loadImage("/images/watermark.png", (error: Error | null, image: ImageData) => {
        if (error) {
          throw error;
        }

        map.addImage("watermark", image);
      });

      map.resize();

      applySources(map);
      applyLayers(map);
      applyInteractions(map, app);
      applyImageMissingHandler(map);
    });

    return () => map.current?.remove();
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
        center: coordinates as [number, number],
        duration: 500,
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
    (store) => ({
      exporting: store.exports.exporting,
      aspectRatio: store.editor.aspectRatio,
      screen: store.platform.screen,
    }),
    ({ exporting, aspectRatio, screen }) => {
      const canvas = map.current?.getCanvas();
      if (!canvas || !wrapper.current || !container.current) {
        return;
      }

      const dimensions = {
        width: container.current.clientWidth,
        height: container.current.clientHeight,
      };

      Object.assign(wrapper.current.style, computeMapDimensions(aspectRatio, dimensions));

      if (exporting) {
        const ratio = computeResizingRatio(aspectRatio, dimensions);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.devicePixelRatio = Math.max(screen.pixelRatio, ratio);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.devicePixelRatio = screen.pixelRatio;
      }

      // Queues this up for after all rerender occurs.
      setTimeout(() => {
        map.current?.resize();

        if (exporting) {
          setTimeout(() => {
            app.exports.generateImage();
          }, 500);
        }
      });
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
          duration: 500,
        });
      }
    }
  );

  /**
   * Sync style then reapply layers and entity features
   */
  useStoreSubscription(
    (store) => store.editor.style,
    (style) => {
      if (!map.current) {
        return;
      }

      map.current.setStyle(styleToUrl(style));

      map.current.once("styledata", () => {
        if (!map.current) {
          return;
        }

        applySources(map.current);
        applyLayers(map.current);

        applyFeatures(map.current, getEntityFeatures(getState()), [MapSource.Routes, MapSource.Pins]);
      });
    }
  );

  /**
   * Sync entities to map
   */
  useStoreSubscription(
    (store) => store.entities.items,
    () => {
      if (!map.current) {
        return;
      }

      applyFeatures(map.current, getEntityFeatures(getState()), [MapSource.Routes, MapSource.Pins]);
    }
  );

  /**
   * Sync next point to map
   */
  useStoreSubscription(
    (store) => ({
      entities: store.entities.items,
      selectedIds: store.selection.ids,
      editorMode: store.editor.mode,
      isDrawing: store.routes.isDrawing,
    }),
    ({ editorMode, isDrawing }) => {
      if (!map.current) {
        return;
      }

      const selectedEntity = getSelectedEntity(getState());

      const features: RawFeature[] = [];
      if (editorMode === "draw" && !isDrawing && selectedEntity?.type === "Route" && selectedEntity.points.length) {
        features.push(getRouteStopOverlay(selectedEntity));
      }

      applyFeatures(map.current, features, [MapSource.RouteStop]);
    }
  );

  /**
   * Sync route stop to map
   */
  useStoreSubscription(
    (store) => ({
      entities: store.entities.items,
      selectedIds: store.selection.ids,
      editorMode: store.editor.mode,
      isDrawing: store.routes.isDrawing,
      nextPoint: store.routes.nextPoint,
    }),
    ({ editorMode, isDrawing, nextPoint }) => {
      if (!map.current) {
        return;
      }

      const selectedEntity = getSelectedEntity(getState());

      const features: RawFeature[] = [];
      if (editorMode === "draw" && !isDrawing && selectedEntity?.type === "Route" && selectedEntity.points.length) {
        features.push(getRouteStopOverlay(selectedEntity));

        if (nextPoint) {
          features.push(getNextPointOverlay(selectedEntity, nextPoint));
        }
      }

      applyFeatures(map.current, features, [MapSource.RouteNextPoint]);
    }
  );

  /**
   * Sync selection overlays
   */
  useStoreSubscription(
    (store) => ({
      entities: store.entities.items,
      editorMode: store.editor.mode,
      selectedIds: store.selection.ids,
    }),
    ({ editorMode }) => {
      if (!map.current) {
        return;
      }

      const selectedEntities = editorMode === "select" ? getSelectedEntities(getState()) : [];

      const features: RawFeature[] = [];
      if (editorMode === "select") {
        selectedEntities.forEach((entity) => {
          if (entity.type === "Pin") {
            features.push(getPinOverlay(entity));
          }

          if (entity.type === "Route") {
            features.push(getRouteOverlay(entity));
          }
        });
      }

      applyFeatures(map.current, features, [MapSource.Overlays]);
    }
  );

  /**
   * Sync selection area
   */
  useStoreSubscription(
    (store) => ({
      selectionArea: store.selection.area,
    }),
    ({ selectionArea }) => {
      if (!map.current) {
        return;
      }

      const features: RawFeature[] = [];
      if (selectionArea) {
        features.push(getSelectionAreaOverlay(selectionArea));
      }

      applyFeatures(map.current, features, [MapSource.SelectionArea]);
    }
  );

  /**
   * Sync watermark
   */
  useStoreSubscription(
    (store) => store.editor.mode,
    (editorMode) => {
      if (!map.current) {
        return;
      }

      const features: RawFeature[] = [];

      if (editorMode === "export") {
        features.push(getWatermarkOverlay(map.current.getBounds().getSouthWest().toArray()));
      }

      applyFeatures(map.current, features, [MapSource.Watermark]);
    }
  );

  /**
   * Sync cursor
   */
  useStoreSubscription(
    (store) => ({
      editorMode: store.editor.mode,
      draggedEntityId: store.dragAndDrop.draggedEntityId,
      hoveredEntityId: store.dragAndDrop.hoveredEntityId,
    }),
    ({ editorMode, draggedEntityId, hoveredEntityId }) => {
      if (!map.current) {
        return null;
      }

      const hoveredEntity = getState().entities.items.find((item) => item.id === hoveredEntityId);

      const containerClasses = map.current.getCanvasContainer().classList;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      containerClasses.remove(...containerClasses.values());
      containerClasses.add("mapboxgl-canvas-container");

      if (draggedEntityId) {
        containerClasses.add("grabbing");
      } else if ((editorMode === "draw" || editorMode === "pin") && hoveredEntityId !== STOP_DRAWING_CIRCLE_ID) {
        containerClasses.add("crosshair");
      } else if (hoveredEntity?.type === "Pin") {
        containerClasses.add("grab");
      } else if (hoveredEntity?.type === "Route") {
        containerClasses.add("pointer");
      } else if (hoveredEntityId === STOP_DRAWING_CIRCLE_ID) {
        containerClasses.add("pointer");
      }
    }
  );

  /**
   * Sync events
   */
  useStoreSubscription(
    (store) => store.editor.mode,
    (mode) => {
      if (!map.current) {
        return;
      }

      if (mode === "draw" || mode === "select" || mode === "export") {
        map.current.dragPan.disable();
      } else {
        map.current.dragPan.enable();
      }

      if (mode === "export") {
        map.current.scrollZoom.disable();
      } else {
        map.current.scrollZoom.enable();
      }
    }
  );

  const onCopy = async () => {
    const state = getState();
    const features = getEntityFeatures(state);

    if (!features.length) {
      return false;
    }

    const json = JSON.stringify(featureCollection(features), null, 2);

    await navigator.clipboard.writeText(json);
  };

  const onCut = async () => {
    await onCopy();

    app.selection.deleteSelectedEntities();
  };

  const onPaste = (text: string) => {
    try {
      const features = parseFeatures(text);

      // @todo: validate JSON

      const insertedCount = app.entities.insertFeatures(features);

      if (insertedCount !== features.length) {
        app.alerts.trigger({
          message: `${features.length - insertedCount} features could not be displayed.`,
          icon: WarningIcon,
        });
      }
    } catch (error) {
      app.alerts.trigger({
        message: `Unable to import GeoJson from clipboard:\n${error.message}`,
        color: "red",
        icon: ErrorIcon,
        timeout: 3000,
      });
    }
  };

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>

      <DocumentTitle />

      {map.current && <Clipboard watch={map.current.getCanvas()} onCopy={onCopy} onCut={onCut} onPaste={onPaste} />}

      <div
        className={classNames("flex justify-center items-center w-full h-full bg-gray-200", {
          "md:px-20 md:py-6": aspectRatio !== "fill",
        })}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            app.selection.clear();
          }
        }}
      >
        <div ref={container} className="w-full h-full flex justify-center items-center">
          <div ref={wrapper} className="w-full h-full md:shadow-md border border-gray-400" id="map" />
        </div>
      </div>
    </>
  );
};
