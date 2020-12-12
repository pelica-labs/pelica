import { Position } from "@turf/turf";

import { CoreEntity } from "~/core/entities";
import { Breakpoint } from "~/core/scenes";
import { ID } from "~/lib/id";
import { Style } from "~/map/style";

export type MapModel = {
  id: ID;
  userId: ID;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;

  name?: string;

  coordinates?: Position;
  zoom?: number;
  bearing?: number;
  pitch?: number;

  style?: Style;
  entities?: CoreEntity[];

  breakpoints?: Breakpoint[];
};

export type ImageModel = {
  id: ID;
  mapId: ID;
  createdAt: number;

  path?: string;
  name?: string;
  size?: [number, number];
};
