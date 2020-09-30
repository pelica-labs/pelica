import { Style } from "@mapbox/mapbox-sdk/services/styles";
import throttle from "lodash/throttle";
import mapboxgl, { GeoJSONSource, LngLatBoundsLike, MapMouseEvent } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";

import { MarkerState, RouteState, useStore } from "~/lib/state";

enum MapSource {
  Routes = "routes",
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
        color: marker.strokeColor,
        strokeWidth: marker.strokeWidth,
      },
    });
  }

  return features;
};

export const Map: React.FC<Props> = ({ style, disableInteractions = false, disableSync = false }) => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);

  const coordinates = useStore((store) => store.coordinates);
  const zoom = useStore((store) => store.zoom);
  const place = useStore((store) => store.place);
  const mapStyle = useStore((store) => store.style);
  const editor = useStore((store) => store.editor);
  const routes = useStore((store) => store.routes);
  const currentRoute = useStore((store) => store.currentRoute);
  const move = useStore((store) => store.move);
  const addMarker = useStore((store) => store.addMarker);
  const togglePainting = useStore((store) => store.togglePainting);
  const closePanes = useStore((store) => store.closePanes);
  const startRoute = useStore((store) => store.startRoute);
  const endRoute = useStore((store) => store.endRoute);

  const [altIsPressed, setAltIsPressed] = useState(false);

  const resolvedStyle = style ?? mapStyle;

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
      center: [coordinates.longitude, coordinates.latitude],
      zoom,
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
        if (!map.current?.getSource(MapSource.Routes)) {
          map.current?.addSource(MapSource.Routes, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: routesToFeatures(routes),
            },
          });
        }

        if (!map.current?.getLayer(MapSource.Routes)) {
          map.current?.addLayer({
            id: MapSource.Routes,
            type: "line",
            source: MapSource.Routes,
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
   * Sync alt key state
   */
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      setAltIsPressed(event.altKey);
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
      if (altIsPressed) {
        return;
      }

      if (!editor.isPainting) {
        return;
      }

      addMarker(event.lngLat.lat, event.lngLat.lng);
    }, 1000 / 30);

    const onMouseDown = () => {
      if (altIsPressed) {
        return;
      }

      if (editor.mode === "painting") {
        startRoute();
        togglePainting();
      }
    };

    const onMouseUp = () => {
      if (altIsPressed) {
        return;
      }

      if (editor.mode === "painting") {
        togglePainting(false);
        endRoute();
      }
    };

    const onClick = (event: MapMouseEvent) => {
      closePanes();

      if (editor.mode === "drawing") {
        if (!currentRoute) {
          startRoute();
        } else if (event.originalEvent.altKey) {
          endRoute();
          startRoute();
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
  }, [editor, altIsPressed]);

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
    if (lng === coordinates.longitude && lat === coordinates.latitude && zoom === zoom) {
      return;
    }

    map.current.flyTo({
      center: {
        lng: coordinates.longitude,
        lat: coordinates.latitude,
      },
      zoom: zoom,
    });
  }, [coordinates.latitude, coordinates.longitude]);

  /**
   * Fly to selected place
   */
  useEffect(() => {
    if (!place) {
      return;
    }

    if (disableSync) {
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
  }, [place]);

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
    if (editor.mode === "moving" || altIsPressed) {
      map.current?.dragPan.enable();
      map.current?.scrollZoom.enable();
    } else if (editor.mode === "drawing" || editor.mode === "painting") {
      map.current?.dragPan.disable();
      map.current?.scrollZoom.disable();
    }
  }, [editor.mode, altIsPressed]);

  /**
   * Sync routes
   */
  useEffect(() => {
    const drawings = map.current?.getSource(MapSource.Routes) as GeoJSONSource;

    drawings?.setData({
      type: "FeatureCollection",
      features: routesToFeatures(routes),
    });
  }, [routes]);

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

    if (altIsPressed) {
      map.current.getCanvas().style.cursor = "pointer";
    } else if (editor.mode === "drawing" || editor.mode === "painting") {
      map.current.getCanvas().style.cursor = "crosshair";
    } else if (editor.mode === "moving") {
      map.current.getCanvas().style.cursor = "pointer";
    }
  }, [editor.mode, altIsPressed]);

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={container} className="w-full h-full" />
    </>
  );
};
