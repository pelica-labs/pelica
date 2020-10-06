import { Style } from "@mapbox/mapbox-sdk/services/styles";

import { Point, PolyLine, Position } from "~/lib/geometry";

export type Action = DrawAction | PinAction | ImportGpxAction | UpdateStyleAction | MovePinAction | SelectPinAction;

export type DrawAction = {
  name: "draw";
  line: PolyLine;
};

export type PinAction = {
  name: "pin";
  point: Point;
};

export type ImportGpxAction = {
  name: "importGpx";
  line: PolyLine;
};

export type MovePinAction = {
  name: "movePin";
  pinId: number;
  zoom: number;
  direction: Position;
};

export type UpdateStyleAction = {
  name: "updateStyle";
  style: Style;
};

export type SelectPinAction = {
  name: "selectPin";
  pinId: number;
};
