import { Style } from "@mapbox/mapbox-sdk/services/styles";
import mapboxgl from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef } from "react";

import { useMap } from "~/components/MapContext";

type Props = {
  style?: Style;
  disableSync?: boolean;
  disableInteractions?: boolean;
};

const styleToUrl = (style: Style): string => {
  return `mapbox://styles/${style.owner}/${style.id}`;
};

export const Map: React.FC<Props> = ({ style, disableInteractions = false, disableSync = false }) => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>();
  const { state, move } = useMap();

  const resolvedStyle = style ?? state.style;

  /**
   * Initialize map
   */
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;

    map.current = new mapboxgl.Map({
      container: container.current,
      style: resolvedStyle ? styleToUrl(resolvedStyle) : "mapbox://styles/mapbox/streets-v11",
      center: [state.coordinates.longitude, state.coordinates.latitude],
      zoom: state.zoom,
      logoPosition: "bottom-right",
      attributionControl: false,
    });

    if (disableInteractions) {
      map.current.dragPan.disable();
      map.current.scrollZoom.disable();
    }

    map.current.on("moveend", (event) => {
      const { lng, lat } = event.target.getCenter();
      const zoom = event.target.getZoom();

      move(lat, lng, zoom);
    });

    return () => {
      map.current.remove();
    };
  }, []);

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

    map.current.flyTo({
      center: {
        lng: state.place.center[0],
        lat: state.place.center[1],
      },
      zoom: 9,
    });
  }, [state.place]);

  /**
   * Update style
   */
  useEffect(() => {
    if (!resolvedStyle) {
      return;
    }

    map.current.setStyle(styleToUrl(resolvedStyle));
  }, [resolvedStyle]);

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={container} className="w-full h-full" />
    </>
  );
};
