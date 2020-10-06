import { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import MapboxMapMatching from "@mapbox/mapbox-sdk/services/map-matching";
import { Style } from "@mapbox/mapbox-sdk/services/styles";

import { Coordinates } from "~/lib/geometry";

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error("Missing Mapbox public token");
}

const config: SdkConfig = {
  accessToken,
};

export const mapboxGeocoding = MapboxGeocoding(config);

export const mapboxMapMatching = MapboxMapMatching(config);

export const defaultStyle: Partial<Style> = {
  // make this configurable
  id: "ckfy50y250eq019qwbenxy5b0",
  owner: "bstnfrmry",
  name: "Default",
};

export const styleToUrl = (style: Style): string => {
  return `mapbox://styles/${style.owner}/${style.id}`;
};

type StaticImageOptions = {
  coordinates: Coordinates;
  zoom: number;
  bearing: number;
  pitch: number;
  style: Style;
  size: number;
};

export const staticImage = (options: StaticImageOptions): string => {
  return `https://api.mapbox.com/styles/v1/${options.style.owner}/${options.style.id}/static/${options.coordinates.longitude},${options.coordinates.latitude},${options.zoom},${options.bearing},${options.pitch}/${options.size}x${options.size}@2x?access_token=${accessToken}&attribution=false&logo=false`;
};
