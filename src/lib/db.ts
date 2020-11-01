import { Position } from "@turf/turf";

import { Entity } from "~/core/entities";
import { ID } from "~/lib/id";
import { Style } from "~/lib/style";

export type MapModel = {
  id: ID;
  userId: ID;
  createdAt: number;
  updatedAt: number;

  name?: string;

  coordinates?: Position;
  zoom?: number;
  bearing?: number;
  pitch?: number;

  style?: Style;
  entities?: Entity[];
};
