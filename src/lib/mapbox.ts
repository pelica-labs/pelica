import { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import MapboxMapMatching from "@mapbox/mapbox-sdk/services/map-matching";

export const accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error("Missing Mapbox public token");
}

const config: SdkConfig = {
  accessToken,
};

export const mapboxGeocoding = MapboxGeocoding(config);

export const mapboxMapMatching = MapboxMapMatching(config);
