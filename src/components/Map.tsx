import mapboxgl from "mapbox-gl";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";

type Props = {};

export const Map: React.FC<Props> = () => {
  const [map, setMap] = useState(null);
  const mapRef = useRef<HTMLDivElement>();

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;

    setMap(
      new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-74.5, 40],
        zoom: 9,
      })
    );
  }, []);

  return (
    <>
      <Head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
};
