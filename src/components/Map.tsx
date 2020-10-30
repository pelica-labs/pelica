import { featureCollection } from "@turf/turf";
import classNames from "classnames";
import { debounce } from "lodash";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { Clipboard } from "~/components/Clipboard";
import { DocumentTitle } from "~/components/DocumentTitle";
import { ErrorIcon, WarningIcon } from "~/components/Icon";
import { app, getState, useStore, useStoreSubscription } from "~/core/app";
import { entityToFeature } from "~/core/entities";
import {
  getNextPointOverlay,
  getPinOverlay,
  getRouteOverlay,
  getRouteStopOverlay,
  getSelectionAreaOverlay,
  getTextOverlay,
  getWatermarkOverlay,
} from "~/core/overlays";
import { upscale } from "~/core/platform";
import { STOP_DRAWING_CIRCLE_ID } from "~/core/routes";
import { getEntityFeatures, getMap, getSelectedEntities, getSelectedEntity } from "~/core/selectors";
import { computeMapDimensions, computeResizingRatio } from "~/lib/aspectRatio";
import { getEnv } from "~/lib/config";
import { styleToUrl } from "~/lib/style";
import { applyFeatures, parseFeatures, RawFeature } from "~/map/features";
import { applyImageMissingHandler } from "~/map/imageMissing";
import { applyClickInteractions } from "~/map/interactions/click";
import { applyHoverInteractions } from "~/map/interactions/hover";
import { applyKeyboardInteractions } from "~/map/interactions/keyboard";
import { applyMoveInteractions } from "~/map/interactions/move";
import { applyPinchInteractions } from "~/map/interactions/pinch";
import { applyResizeInteractions } from "~/map/interactions/resize";
import { applyRightClickInteractions } from "~/map/interactions/rightClick";
import { applyScrollInteractions } from "~/map/interactions/scroll";
import { applyLayers } from "~/map/layers";
import { applySources, MapSource } from "~/map/sources";

export const Map: React.FC = () => {
  // const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const aspectRatio = useStore((store) => store.editor.aspectRatio);
  const editorMode = useStore((store) => store.editor.mode);
  const exporting = useStore((store) => store.exports.exporting);

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

    const map = new mapboxgl.Map({
      accessToken,
      container: wrapper.current,
      style: styleToUrl(state.editor.style),
      center: state.map.coordinates as [number, number],
      zoom: state.map.zoom,
      bearing: state.map.bearing,
      pitch: state.map.pitch,
      doubleClickZoom: false,
      fadeDuration: 0,
      logoPosition: state.platform.screen.dimensions.md ? "bottom-right" : "top-right",
      preserveDrawingBuffer: true,
    });

    app.map.initialize(map);

    map.on("load", async () => {
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

      applySources();
      applyLayers();

      applyMoveInteractions();
      applyHoverInteractions();
      applyPinchInteractions();
      applyScrollInteractions();
      applyKeyboardInteractions();
      applyClickInteractions();
      applyRightClickInteractions();
      applyResizeInteractions();

      applyImageMissingHandler();
    });

    return () => map.remove();
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
      getMap().flyTo({
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
      getMap().zoomTo(zoom);
    }
  );

  /**
   * Sync bearing
   */
  useStoreSubscription(
    (store) => store.map.bearing,
    (bearing) => {
      getMap().setBearing(bearing);
    }
  );

  /**
   * Sync pitch
   */
  useStoreSubscription(
    (store) => store.map.pitch,
    (pitch) => {
      getMap().setPitch(pitch);
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
      const canvas = getMap().getCanvas();
      if (!canvas || !wrapper.current || !container.current) {
        return;
      }

      const dimensions = {
        width: container.current.clientWidth,
        height: container.current.clientHeight,
      };

      Object.assign(wrapper.current.style, computeMapDimensions(aspectRatio, dimensions));

      if (exporting) {
        upscale(screen.pixelRatio * computeResizingRatio(aspectRatio, dimensions));
      } else {
        upscale(screen.pixelRatio);
      }

      // Queues this up for after all rerender occurs.
      setTimeout(() => {
        getMap().resize();

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
        getMap().fitBounds(place.bbox as LngLatBoundsLike, { padding: 10 });
      } else {
        getMap().flyTo({
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
      const map = getMap();

      map.setStyle(styleToUrl(style));

      map.once("styledata", () => {
        applySources();
        applyLayers();

        applyFeatures(getEntityFeatures(), [MapSource.Routes, MapSource.Pins, MapSource.Texts]);
      });
    }
  );

  /**
   * Sync entities to map
   */
  useStoreSubscription(
    (store) => store.entities.items,
    () => {
      applyFeatures(getEntityFeatures(), [MapSource.Routes, MapSource.Pins, MapSource.Texts]);
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
      const selectedEntity = getSelectedEntity();

      const features: RawFeature[] = [];
      if (editorMode === "draw" && !isDrawing && selectedEntity?.type === "Route" && selectedEntity.points.length) {
        features.push(getRouteStopOverlay(selectedEntity));
      }

      applyFeatures(features, [MapSource.RouteStop]);
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
      const selectedEntity = getSelectedEntity();

      const features: RawFeature[] = [];
      if (editorMode === "draw" && !isDrawing && selectedEntity?.type === "Route") {
        if (selectedEntity.points.length) {
          features.push(getRouteStopOverlay(selectedEntity));
        }

        if (nextPoint) {
          features.push(getNextPointOverlay(selectedEntity, nextPoint));
        }
      }

      applyFeatures(features, [MapSource.RouteNextPoint]);
    }
  );

  /**
   * Sync text preview to map
   */
  useStoreSubscription(
    (store) => ({
      editorMode: store.editor.mode,
      nextPoint: store.texts.nextPoint,
      textStyle: store.texts.style,
    }),
    ({ editorMode, nextPoint, textStyle }) => {
      const features: RawFeature[] = [];
      if (editorMode === "text" && nextPoint) {
        const feature = entityToFeature({
          type: "Text",
          id: -1,
          source: MapSource.TextPreview,
          coordinates: nextPoint,
          style: textStyle,
        }) as RawFeature;

        features.push(feature);
      }

      applyFeatures(features, [MapSource.TextPreview]);
    }
  );

  /**
   * Sync pin preview to map
   */
  useStoreSubscription(
    (store) => ({
      editorMode: store.editor.mode,
      nextPoint: store.pins.nextPoint,
      pinStyle: store.pins.style,
    }),
    ({ editorMode, nextPoint, pinStyle }) => {
      const features: RawFeature[] = [];
      if (editorMode === "pin" && nextPoint) {
        const feature = entityToFeature({
          type: "Pin",
          id: -1,
          source: MapSource.PinPreview,
          coordinates: nextPoint,
          style: pinStyle,
        }) as RawFeature;

        features.push(feature);
      }

      applyFeatures(features, [MapSource.PinPreview]);
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
      zoom: store.map.zoom,
    }),
    ({ editorMode, zoom }) => {
      const selectedEntities = editorMode === "select" ? getSelectedEntities() : [];

      const features: RawFeature[] = [];
      if (editorMode === "select") {
        selectedEntities.forEach((entity) => {
          if (entity.type === "Pin") {
            features.push(getPinOverlay(entity));
          }

          if (entity.type === "Route") {
            features.push(getRouteOverlay(entity));
          }

          if (entity.type === "Text") {
            features.push(getTextOverlay(entity, zoom));
          }
        });
      }

      applyFeatures(features, [MapSource.Overlays]);
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
      const features: RawFeature[] = [];
      if (selectionArea) {
        features.push(getSelectionAreaOverlay(selectionArea));
      }

      applyFeatures(features, [MapSource.SelectionArea]);
    }
  );

  /**
   * Sync watermark
   */
  useStoreSubscription(
    (store) => ({
      editorMode: store.editor.mode,
      exporting: store.exports.exporting,
    }),
    ({ editorMode, exporting }) => {
      const features: RawFeature[] = [];
      const mapboxControls = document.querySelector(".mapboxgl-control-container")?.classList;

      if (exporting) {
        features.push(getWatermarkOverlay(getMap().getBounds().getSouthWest().toArray()));
      }

      if (editorMode === "export" || exporting) {
        mapboxControls?.add("hidden");
      } else {
        mapboxControls?.remove("hidden");
      }

      applyFeatures(features, [MapSource.Watermark]);
    }
  );

  /**
   * Sync cursor
   */
  useStoreSubscription(
    (store) => ({
      editorMode: store.editor.mode,
      moving: store.editor.moving,
      hoveredEntityId: store.dragAndDrop.hoveredEntityId,
    }),
    ({ editorMode, hoveredEntityId, moving }) => {
      const containerClasses = getMap().getCanvasContainer().classList;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      containerClasses.remove(...containerClasses.values());
      containerClasses.add("mapboxgl-canvas-container");

      if (moving) {
        containerClasses.add("move");
      } else if (editorMode === "pin" || editorMode === "text") {
        containerClasses.add("place");
      } else if (editorMode === "draw" && hoveredEntityId !== STOP_DRAWING_CIRCLE_ID) {
        containerClasses.add("draw");
      }
    }
  );

  /**
   * Sync events
   */
  useStoreSubscription(
    (store) => ({ editorMode: store.editor.mode, moving: store.editor.moving }),
    ({ editorMode, moving }) => {
      const setMinDragTouches = (min: number) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        getMap().dragPan._touchPan._minTouches = min;
      };

      if ((editorMode === "draw" || editorMode === "select") && !moving) {
        setMinDragTouches(2);
      } else {
        setMinDragTouches(1);
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

      {getMap() && <Clipboard watch={getMap().getCanvas()} onCopy={onCopy} onCut={onCut} onPaste={onPaste} />}

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
        <div ref={container} className="relative w-full h-full flex justify-center items-center">
          <div
            ref={wrapper}
            className={classNames({
              "relative w-full h-full md:shadow-md": true,
              "border border-gray-400": aspectRatio !== "fill",
            })}
            id="map"
          >
            {editorMode === "export" && !exporting && (
              <div className="absolute bottom-0 left-0 flex mb-1 ml-1">
                <img alt="Watermark" className="w-24" src="/images/watermark.png" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
