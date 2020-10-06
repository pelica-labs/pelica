import { Style } from "@mapbox/mapbox-sdk/services/styles";

import { Coordinates, Point, PolyLine, Position } from "~/lib/geometry";
import { SmartMatching } from "~/lib/state";

export type Action =
  | DrawAction
  | PinAction
  | ImportGpxAction
  | UpdateStyleAction
  | NudgePinAction
  | MovePinAction
  | SelectGeometryAction
  | UpdatePinAction
  | UpdateLineAction
  | UpdateLineSmartMatchingAction
  | DeleteGeometryAction;

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

export type NudgePinAction = {
  name: "nudgePin";
  pinId: number;
  zoom: number;
  direction: Position;
};

export type MovePinAction = {
  name: "movePin";
  pinId: number;
  coordinates: Coordinates;
};

export type UpdateStyleAction = {
  name: "updateStyle";
  style: Style;
};

export type SelectGeometryAction = {
  name: "selectGeometry";
  geometryId: number;
};

export type DeleteGeometryAction = {
  name: "deleteGeometry";
  geometryId: number;
};

export type UpdatePinAction = {
  name: "updatePin";
  pinId: number;
  strokeColor: string;
  strokeWidth: number;
};

export type UpdateLineAction = {
  name: "updateLine";
  lineId: number;
  strokeColor: string;
  strokeWidth: number;
};

export type UpdateLineSmartMatchingAction = {
  name: "updateLineSmartMatching";
  lineId: number;
  smartPoints: Coordinates[];
  smartMatching: SmartMatching;
};
