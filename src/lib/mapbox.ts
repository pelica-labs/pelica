import MapboxClient from "@mapbox/mapbox-sdk";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import mapboxgl from "mapbox-gl";

export const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;

export const registerAccessToken = (): void => {
  mapboxgl.accessToken = ACCESS_TOKEN;
};

export const mapbox = MapboxClient({ accessToken: ACCESS_TOKEN });

export const geocoding = MapboxGeocoding(mapbox);
