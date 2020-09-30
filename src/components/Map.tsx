import { Style } from "@mapbox/mapbox-sdk/services/styles";
import throttle from "lodash/throttle";
import mapboxgl, { GeoJSONSource, LngLatBoundsLike, MapMouseEvent } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";

import { MarkerState, RouteState, useMap } from "~/components/MapContext";

enum MapSource {
  Drawing = "drawing",
}

type Props = {
  style?: Style;
  disableSync?: boolean;
  disableInteractions?: boolean;
};

const styleToUrl = (style: Style): string => {
  return `mapbox://styles/${style.owner}/${style.id}`;
};

const routesToFeatures = (routes: RouteState[]): GeoJSON.Feature<GeoJSON.Geometry>[] => {
  return routes.flatMap((route) => markersToFeatures(route.markers));
};

const markersToFeatures = (markers: MarkerState[]): GeoJSON.Feature<GeoJSON.Geometry>[] => {
  if (markers.length < 2) {
    return [];
  }

  const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [];
  for (let i = 1; i < markers.length; i++) {
    const previousMarker = markers[i - 1];
    const marker = markers[i];

    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [previousMarker.coordinates.longitude, previousMarker.coordinates.latitude],
          [marker.coordinates.longitude, marker.coordinates.latitude],
        ],
      },
      properties: {
        color: marker.color,
        strokeWidth: marker.strokeWidth,
      },
    });
  }

  return features;
};

export const Map: React.FC<Props> = ({ style, disableInteractions = false, disableSync = false }) => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);
  const { state, move, addMarker, togglePainting, closePanes, addRoute } = useMap();
  const [metaIsPressed, setMetaIsPressed] = useState(false);

  const resolvedStyle = style ?? state.style;

  /**
   * Initialize map
   */
  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!accessToken) {
      throw new Error("Missing Mapbox public token");
    }

    if (!container.current) {
      return;
    }

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: container.current,
      style: resolvedStyle ? styleToUrl(resolvedStyle) : "mapbox://styles/mapbox/streets-v11",
      center: [state.coordinates.longitude, state.coordinates.latitude],
      zoom: state.zoom,
      logoPosition: "bottom-right",
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    map.current?.on("load", () => {
      if (disableInteractions) {
        map.current?.dragPan.disable();
        map.current?.scrollZoom.disable();
      }

      const applySourcesAndLayers = () => {
        if (!map.current?.getSource(MapSource.Drawing)) {
          map.current?.addSource(MapSource.Drawing, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: routesToFeatures(state.routes),
            },
          });
        }

        if (!map.current?.getLayer(MapSource.Drawing)) {
          map.current?.addLayer({
            id: MapSource.Drawing,
            type: "line",
            source: MapSource.Drawing,
            paint: {
              "line-color": ["get", "color"],
              "line-width": ["get", "strokeWidth"],
            },
          });
        }
      };

      if (!disableInteractions) {
        applySourcesAndLayers();
        map.current?.on("styledata", () => {
          applySourcesAndLayers();
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  /**
   * Sync meta-key state
   */
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      setMetaIsPressed(event.metaKey);
    };

    window.addEventListener("keydown", onKeyPress, false);
    window.addEventListener("keyup", onKeyPress, false);

    return () => {
      window.removeEventListener("keydown", onKeyPress, false);
      window.removeEventListener("keyup", onKeyPress, false);
    };
  }, []);

  /**
   * Handle interactions
   */
  useEffect(() => {
    if (disableInteractions) {
      return;
    }

    const onMoveEnd = (event: MapMouseEvent) => {
      const { lng, lat } = event.target.getCenter();
      const zoom = event.target.getZoom();

      move(lat, lng, zoom);
    };

    const onMouseMove = throttle((event: MapMouseEvent) => {
      if (metaIsPressed) {
        return;
      }

      if (!state.editor.isPainting) {
        return;
      }

      addMarker(event.lngLat.lat, event.lngLat.lng);
    }, 1);

    const onMouseDown = () => {
      if (metaIsPressed) {
        return;
      }

      if (state.editor.mode === "painting") {
        togglePainting();
      }
    };

    const onMouseUp = () => {
      if (metaIsPressed) {
        return;
      }

      if (state.editor.mode === "painting") {
        togglePainting(false);
      }
    };

    const onClick = (event: MapMouseEvent) => {
      closePanes();

      if (state.editor.mode === "drawing") {
        if (event.originalEvent.altKey) {
          addRoute();
        }

        addMarker(event.lngLat.lat, event.lngLat.lng);
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
  }, [state.editor, metaIsPressed]);

  /**
   * Update map when local state changes
   */
  useEffect(() => {
    if (!map.current) {
      return;
    }

    if (disableSync) {
      return;
    }

    const { lng, lat } = map.current.getCenter();
    const zoom = map.current.getZoom();
    if (lng === state.coordinates.longitude && lat === state.coordinates.latitude && zoom === state.zoom) {
      return;
    }

    map.current.flyTo({
      center: {
        lng: state.coordinates.longitude,
        lat: state.coordinates.latitude,
      },
      zoom: state.zoom,
    });
  }, [state.coordinates.latitude, state.coordinates.longitude]);

  /**
   * Fly to selected place
   */
  useEffect(() => {
    if (!state.place) {
      return;
    }

    if (disableSync) {
      return;
    }

    if (state.place.bbox) {
      map.current?.fitBounds(state.place.bbox as LngLatBoundsLike, { padding: 10 });
    } else {
      map.current?.flyTo({
        center: {
          lng: state.place.center[0],
          lat: state.place.center[1],
        },
        zoom: 14,
      });
    }
  }, [state.place]);

  /**
   * Update style
   */
  useEffect(() => {
    if (!resolvedStyle) {
      return;
    }

    map.current?.setStyle(styleToUrl(resolvedStyle));
  }, [resolvedStyle]);

  /**
   * Update interactivity
   */
  useEffect(() => {
    if (state.editor.mode === "moving" || metaIsPressed) {
      map.current?.dragPan.enable();
      map.current?.scrollZoom.enable();
    } else if (state.editor.mode === "drawing" || state.editor.mode === "painting") {
      map.current?.dragPan.disable();
      map.current?.scrollZoom.disable();
    }
  }, [state.editor.mode, metaIsPressed]);

  /**
   * Sync routes
   */
  useEffect(() => {
    const drawings = map.current?.getSource(MapSource.Drawing) as GeoJSONSource;

    drawings?.setData({
      type: "FeatureCollection",
      features: routesToFeatures(state.routes),
    });
  }, [state.routes]);

  /**
   * Sync cursor
   */
  useEffect(() => {
    if (!map.current) {
      return;
    }

    if (disableInteractions) {
      return;
    }

    if (metaIsPressed) {
      map.current.getCanvas().style.cursor = "pointer";
    } else if (state.editor.mode === "drawing" || state.editor.mode === "painting") {
      map.current.getCanvas().style.cursor = "crosshair";
    } else if (state.editor.mode === "moving") {
      map.current.getCanvas().style.cursor = "pointer";
    }
  }, [state.editor.mode, metaIsPressed]);

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={container} className="w-full h-full" />
    </>
  );
};