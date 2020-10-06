import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { MercatorCoordinate } from "mapbox-gl";

import { Coordinates, Point, PolyLine, Position } from "~/lib/geometry";
import { MapState, SmartMatching } from "~/lib/state";

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

export const applyAction = (state: MapState, action: Action): void => {
  if (action.name === "draw") {
    state.geometries.push({ ...action.line });
  }

  if (action.name === "pin") {
    state.geometries.push({ ...action.point });
  }

  if (action.name === "importGpx") {
    state.geometries.push({ ...action.line });
  }

  if (action.name === "selectGeometry") {
    if (state.selectedGeometry) {
      state.selectedGeometry.selected = false;
    }

    state.selectedGeometry = state.geometries.find((geometry) => geometry.id === action.geometryId) as Point;
    if (state.selectedGeometry) {
      state.selectedGeometry.selected = true;
    }
  }

  if (action.name === "nudgePin") {
    const point = state.geometries.find((geometry) => geometry.id === action.pinId) as Point;

    const pointCoordinates = MercatorCoordinate.fromLngLat(
      { lng: point.coordinates.longitude, lat: point.coordinates.latitude },
      0
    );

    const base = 2 ** (-action.zoom - 1);
    pointCoordinates.x += base * action.direction.x;
    pointCoordinates.y += base * action.direction.y;

    const { lat, lng } = pointCoordinates.toLngLat();
    point.coordinates = { latitude: lat, longitude: lng };
  }

  if (action.name === "movePin") {
    const point = state.geometries.find((geometry) => geometry.id === action.pinId) as Point;

    point.coordinates = action.coordinates;
  }

  if (action.name === "updatePin") {
    const point = state.geometries.find((geometry) => geometry.id === action.pinId) as Point;

    point.style = {
      strokeWidth: action.strokeWidth,
      strokeColor: action.strokeColor,
    };
  }

  if (action.name === "updateLine") {
    const line = state.geometries.find((geometry) => geometry.id === action.lineId) as PolyLine;

    line.style = {
      strokeWidth: action.strokeWidth,
      strokeColor: action.strokeColor,
    };
  }

  if (action.name === "updateLineSmartMatching") {
    const line = state.geometries.find((geometry) => geometry.id === action.lineId) as PolyLine;

    line.smartMatching = action.smartMatching;
    line.smartPoints = action.smartPoints;
  }

  if (action.name === "deleteGeometry") {
    const geometryIndex = state.geometries.findIndex((geometry) => geometry.id === action.geometryId);
    if (geometryIndex >= 0) {
      state.geometries.splice(geometryIndex, 1);
      state.selectedGeometry = null;
    }
  }

  if (action.name === "updateStyle") {
    state.style = action.style;
  }
};
