import { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import MapboxMapMatching from "@mapbox/mapbox-sdk/services/map-matching";

import { getEnv } from "~/lib/config";

export const accessToken = getEnv("NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN", process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN);

const config: SdkConfig = {
  accessToken,
};

export const mapboxGeocoding = MapboxGeocoding(config);

export const mapboxMapMatching = MapboxMapMatching(config);
