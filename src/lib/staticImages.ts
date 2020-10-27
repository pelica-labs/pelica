import { Position } from "@turf/turf";

import { accessToken } from "~/lib/mapbox";
import { Style } from "~/lib/style";

type StaticImageOptions = {
  coordinates: Position;
  zoom: number;
  bearing: number;
  pitch: number;
  style: Style;
  width: number;
  height: number;
};

export const staticImage = (options: StaticImageOptions): string => {
  return `https://api.mapbox.com/styles/v1/${options.style.owner}/${options.style.id}/static/${options.coordinates[0]},${options.coordinates[1]},${options.zoom},${options.bearing},${options.pitch}/${options.width}x${options.height}@2x?access_token=${accessToken}&attribution=false&logo=false`;
};
