import { featureCollection } from "@turf/turf";
import classNames from "classnames";
import mapboxgl, { GeoJSONSource, LngLatBoundsLike } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { Clipboard } from "~/components/editor/Clipboard";
import { MapTitle } from "~/components/map/MapTitle";
import { app, getState, useStore, useStoreSubscription } from "~/core/app";
import { computeMapDimensions, computeResizingRatio } from "~/core/aspectRatio";
import { MapModel } from "~/core/db";
import { entityToFeature, TransientEntity } from "~/core/entities";
import {
  getNextPointOverlay,
  getPinOverlay,
  getRouteOverlay,
  getRouteStartOverlay,
  getRouteStopOverlay,
  getSelectionAreaOverlay,
  getTextOverlay,
  getWatermarkOverlay,
} from "~/core/overlays";
import { upscale } from "~/core/platform";
import { computeCenter } from "~/core/routes";
import {
  getEntityFeatures,
  getMap,
  getSelectedEntities,
  getSelectedEntity,
  getTransientEntityFeatures,
} from "~/core/selectors";
import { getEnv } from "~/lib/config";
import { applyFeatures, RawFeature } from "~/map/features";
import { applyImageMissingHandler } from "~/map/imageMissing";
import { applyClickInteractions } from "~/map/interactions/click";
import { applyHoverInteractions } from "~/map/interactions/hover";
import { applyKeyboardInteractions } from "~/map/interactions/keyboard";
import { applyMoveInteractions } from "~/map/interactions/move";
import { applyPinchInteractions } from "~/map/interactions/pinch";
import { applyResizeInteractions } from "~/map/interactions/resize";
import { applyRightClickInteractions } from "~/map/interactions/rightClick";
import { applyScrollInteractions } from "~/map/interactions/scroll";
import { applyLanguage } from "~/map/languages";
import { applyLayers } from "~/map/layers";
import { applySources, MapSource, setSourceCluster } from "~/map/sources";
import { styleToUrl } from "~/map/style";
import { applyTerrain } from "~/map/terrain";
import { applyWatermark } from "~/map/watermark";

type Props = {
  map: MapModel;

  readOnly?: boolean;
  disableInteractions?: boolean;
  background?: boolean;
};

export const Map: React.FC<Props> = ({
  map: mapModel,
  readOnly = false,
  disableInteractions = false,
  background: background = false,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const aspectRatio = useStore((store) => store.editor.aspectRatio);

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!wrapper.current) {
      return;
    }

    if (!background) {
      app.sync.reset();
      app.platform.initialize();
      app.sync.mergeState(mapModel);
    }

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
      logoPosition: "bottom-right",
      preserveDrawingBuffer: true,
      interactive: !disableInteractions,
    });

    if (background) {
      app.map.initializeBackgroundMap(map);
    } else {
      app.map.initializeMap(map);
    }

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

      applyWatermark(map);
      applySources(map);
      applyLayers(map);
      applyTerrain(map);
      applyLanguage(map);
      applyFeatures(map, getEntityFeatures(), [MapSource.Route, MapSource.Pin, MapSource.Text]);

      if (!readOnly) {
        applyScrollInteractions(map);
        applyPinchInteractions(map);
        applyMoveInteractions(map);
        applyHoverInteractions(map);
        applyKeyboardInteractions(map);
        applyClickInteractions(map);
        applyRightClickInteractions(map);
        applyResizeInteractions(map);
      }

      applyImageMissingHandler(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  if (!background) {
    /**
     * Sync coordinates
     */
    useStoreSubscription(
      (store) => store.map.coordinates,
      (coordinates) => {
        getMap().setCenter(coordinates as [number, number]);
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
     * Sync language
     */
    useStoreSubscription(
      (store) => store.editor.language,
      () => {
        applyLanguage(getMap());
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
          if (!background) {
            getMap().resize();
          }

          if (exporting) {
            setTimeout(() => {
              document.querySelector("#watermark")?.classList.toggle("hidden");
              applyFeatures(
                getMap(),
                [getWatermarkOverlay(getMap().getBounds().getSouthWest().toArray())],
                [MapSource.Watermark]
              );

              getMap().once("idle", () => {
                app.exports.generateImage();

                applyFeatures(getMap(), [], [MapSource.Watermark]);
                document.querySelector("#watermark")?.classList.toggle("hidden");
              });
            });
          }
        });
      }
    );

    /**
     * Sync bounds
     */
    useStoreSubscription(
      (store) => store.map.bounds,
      (bounds) => {
        getMap().fitBounds(bounds as LngLatBoundsLike, { padding: 10 });
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
          applySources(map);
          applyLayers(map);
          applyTerrain(map);

          applyFeatures(map, getEntityFeatures(), [MapSource.Route, MapSource.Pin, MapSource.Text]);
        });
      }
    );

    /**
     * Sync transient entities
     */
    useStoreSubscription(
      (store) => ({ isRouteEditing: store.editor.isRouteEditing, selectedEntity: getSelectedEntity(store) }),
      ({ isRouteEditing, selectedEntity }) => {
        const transientItems: TransientEntity[] = [];
        if (selectedEntity?.type === "Route" && !selectedEntity.itinerary && isRouteEditing) {
          const points = selectedEntity.transientPoints.length ? selectedEntity.transientPoints : selectedEntity.points;

          points.forEach((point, index) => {
            transientItems.push({
              id: 10 ** 6 + index,
              type: "RouteVertex",
              source: MapSource.RouteVertex,
              coordinates: point,
              style: selectedEntity.style,
              routeId: selectedEntity.id,
              pointIndex: index,
            });

            if (index) {
              const edgeId = 10 ** 7 + index;
              const edgeCenterId = 10 ** 8 + index;

              transientItems.push({
                id: edgeCenterId,
                type: "RouteEdgeCenter",
                source: MapSource.RouteEdgeCenter,
                coordinates: computeCenter(points[index - 1], points[index]),
                style: selectedEntity.style,
                routeId: selectedEntity.id,
                pointIndex: index,
                edgeId,
              });

              transientItems.push({
                id: edgeId,
                type: "RouteEdge",
                source: MapSource.RouteEdge,
                routeId: selectedEntity.id,
                style: selectedEntity.style,
                fromIndex: index - 1,
                from: selectedEntity.points[index - 1],
                to: point,
                centerId: edgeCenterId,
              });
            }
          });
        }

        app.entities.updateTransientFeatures(transientItems);
      }
    );

    /**
     * Sync entities to map
     */
    useStoreSubscription(
      (store) => ({ entities: store.entities.items }),
      () => {
        applyFeatures(getMap(), getEntityFeatures(), [MapSource.Route, MapSource.Pin, MapSource.Text]);
      }
    );

    /**
     * Sync transient entities to map
     */
    useStoreSubscription(
      (store) => ({ entities: store.entities.transientItems }),
      () => {
        applyFeatures(getMap(), getTransientEntityFeatures(), [
          MapSource.RouteVertex,
          MapSource.RouteEdge,
          MapSource.RouteEdgeCenter,
        ]);
      }
    );

    /**
     * Sync cluster option
     */
    useStoreSubscription(
      (store) => store.pins.clusterPoints,
      (clusterPoints) => {
        const source = getMap().getSource(MapSource.Pin) as GeoJSONSource;
        setSourceCluster(source, clusterPoints);

        applyFeatures(getMap(), getEntityFeatures(), [MapSource.Pin]);
      }
    );

    /**
     * Sync route stop
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
        if (editorMode === "route" && !isDrawing && selectedEntity?.type === "Route" && selectedEntity.points.length) {
          features.push(getRouteStopOverlay(selectedEntity));

          if (selectedEntity.points.length > 2) {
            features.push(getRouteStartOverlay(selectedEntity));
          }
        }

        applyFeatures(getMap(), features, [MapSource.RouteStop, MapSource.RouteStart]);
      }
    );

    /**
     * Sync next point
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
        if (editorMode === "route" && !isDrawing && selectedEntity?.type === "Route") {
          if (selectedEntity.points.length) {
            features.push(getRouteStopOverlay(selectedEntity));
          }

          if (nextPoint) {
            features.push(getNextPointOverlay(selectedEntity, nextPoint));
          }
        }

        applyFeatures(getMap(), features, [MapSource.RouteNextPoint]);
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
            id: "TEXT_PREVIEW",
            source: MapSource.TextPreview,
            coordinates: nextPoint,
            style: textStyle,
          }) as RawFeature;

          features.push(feature);
        }

        applyFeatures(getMap(), features, [MapSource.TextPreview]);
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
            id: "PIN_PREVIEW",
            source: MapSource.PinPreview,
            coordinates: nextPoint,
            style: pinStyle,
          }) as RawFeature;

          features.push(feature);
        }

        applyFeatures(getMap(), features, [MapSource.PinPreview]);
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

            if (entity.type === "Route" && entity.points.length > 0) {
              features.push(getRouteOverlay(entity));
            }

            if (entity.type === "Text") {
              features.push(getTextOverlay(entity, zoom));
            }
          });
        }

        applyFeatures(getMap(), features, [MapSource.Overlay]);
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

        applyFeatures(getMap(), features, [MapSource.SelectionArea]);
      }
    );

    /**
     * Sync 3D
     */
    useStoreSubscription(
      (store) => store.terrain,
      () => {
        applyTerrain(getMap());
      }
    );

    /**
     * Sync cursor
     */
    useStoreSubscription(
      (store) => ({
        editorMode: store.editor.mode,
        moving: store.editor.isMoving,
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
        } else if (editorMode === "route" && hoveredEntityId !== "ROUTE_STOP") {
          containerClasses.add("draw");
        }
      }
    );

    /**
     * Sync events
     */
    useStoreSubscription(
      (store) => ({ editorMode: store.editor.mode, moving: store.editor.isMoving }),
      ({ editorMode, moving }) => {
        const setMinDragTouches = (min: number) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          getMap().dragPan._touchPan._minTouches = min;
        };

        if ((editorMode === "route" || editorMode === "select") && !moving) {
          setMinDragTouches(2);
        } else {
          setMinDragTouches(1);
        }
      }
    );
  }

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
    app.imports.importText(text);
  };

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.css" rel="stylesheet" />
      </Head>

      <MapTitle />

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
          />
        </div>
      </div>
    </>
  );
};
