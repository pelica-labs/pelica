import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { throttle } from "lodash";
import mapboxgl, { LngLatBoundsLike, MapMouseEvent } from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { applyActions } from "~/lib/actions";
import { useAltKey } from "~/lib/altKey";
import { applyLayers } from "~/lib/layers";
import { styleToUrl } from "~/lib/mapbox";
import { applySources } from "~/lib/sources";
import { useStore } from "~/lib/state";

type Props = {
  style?: Style;
  disableSync?: boolean;
  disableInteractions?: boolean;
};

export const Map: React.FC<Props> = ({ style, disableInteractions = false, disableSync = false }) => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>(null);

  const coordinates = useStore((store) => store.coordinates);
  const zoom = useStore((store) => store.zoom);
  const place = useStore((store) => store.place);
  const mapStyle = useStore((store) => store.style);
  const editor = useStore((store) => store.editor);
  const currentAction = useStore((store) => store.currentBrush);
  const actions = useStore((store) => store.actions);
  const dispatch = useStore((store) => store.dispatch);

  const altIsPressed = useAltKey();

  const resolvedStyle = style ?? mapStyle;

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
   * Handle interactions
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
      if (altIsPressed) {
        return;
      }

      if (!editor.isPainting) {
        return;
      }

      dispatch.brush(event.lngLat.lat, event.lngLat.lng);
    }, 1000 / 30);

    const onMouseDown = () => {
      if (altIsPressed) {
        return;
      }

      if (editor.mode === "brush") {
        dispatch.startBrush();
      }
    };

    const onMouseUp = () => {
      if (altIsPressed) {
        return;
      }

      if (editor.mode === "brush") {
        dispatch.endBrush();
      }
    };

    const onClick = (event: MapMouseEvent) => {
      if (altIsPressed) {
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
  }, [coordinates.latitude, coordinates.longitude, zoom]);

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
    if (editor.mode === "move" || altIsPressed) {
      map.current?.dragPan.enable();
      map.current?.scrollZoom.enable();
    } else if (editor.mode === "trace" || editor.mode === "brush") {
      map.current?.dragPan.disable();
      map.current?.scrollZoom.disable();
    }
  }, [editor.mode, altIsPressed]);

  /**
   * Sync actions
   */
  useEffect(() => {
    if (!map.current) {
      return;
    }

    const allActions = [...actions];
    if (currentAction) {
      allActions.push(currentAction);
    }

    applyActions(map.current, allActions);
  }, [actions, currentAction]);

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
    } else if (editor.mode === "trace" || editor.mode === "brush" || editor.mode === "pin") {
      map.current.getCanvas().style.cursor = "crosshair";
    } else if (editor.mode === "move") {
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
