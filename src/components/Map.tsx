import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import produce from "immer";
import mapboxgl from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";

import { registerAccessToken } from "../lib/mapbox";

type Props = {
  selectedPlace?: GeocodeFeature;
};

type MapState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export const Map: React.FC<Props> = ({ selectedPlace }) => {
  const map = useRef<mapboxgl.Map>();
  const container = useRef<HTMLDivElement>();
  const [state, setState] = useState<MapState>({
    longitude: -74.5,
    latitude: 40,
    zoom: 9,
  });

  /**
   * Initialize map
   */
  useEffect(() => {
    registerAccessToken();

    map.current = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [state.longitude, state.latitude],
      zoom: state.zoom,
    });

    map.current.on("moveend", (event) => {
      console.log("Move end");
      setState(
        produce((state) => {
          const { lng, lat } = event.target.getCenter();
          const zoom = event.target.getZoom();

          state.longitude = lng;
          state.latitude = lat;
          state.zoom = zoom;
        })
      );
    });
  }, []);

  /**
   * Update map when local state changes
   */
  useEffect(() => {
    if (!map.current) {
      return;
    }

    const { lng, lat } = map.current.getCenter();
    const zoom = map.current.getZoom();
    if (lng === state.longitude && lat === state.latitude && zoom === state.zoom) {
      return;
    }

    map.current.flyTo({
      center: {
        lng: state.longitude,
        lat: state.latitude,
      },
      zoom: state.zoom,
    });
  }, [state.latitude, state.longitude]);

  /**
   * Fly to selected place
   */
  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    map.current.flyTo({
      center: {
        lng: selectedPlace.center[0],
        lat: selectedPlace.center[1],
      },
      zoom: 9,
    });
  }, [selectedPlace]);

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={container} className="w-full h-full" />
    </>
  );
};
