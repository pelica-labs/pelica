import { MercatorCoordinate } from "mapbox-gl";

import { State } from "~/core/app";
import { Coordinates, Geometry, Point, PolyLine, Position } from "~/core/geometries";
import { SmartMatching } from "~/lib/smartMatching";
import { Style } from "~/lib/style";

export type Handler<T extends Action> = {
  apply: (state: State, action: T) => void;
  undo: (state: State, action: Required<T>) => void;
};

export type Action =
  | DrawAction
  | PinAction
  | ImportGpxAction
  | UpdateStyleAction
  | NudgePinAction
  | MovePinAction
  | UpdatePinAction
  | UpdateLineAction
  | UpdateLineSmartMatchingAction
  | DeleteGeometryAction;

// ---

type DrawAction = {
  name: "draw";
  line: PolyLine;
};

const DrawHandler: Handler<DrawAction> = {
  apply: ({ geometries }, action) => {
    geometries.items.push({ ...action.line });
  },

  undo: ({ geometries }, action) => {
    geometries.items.splice(geometries.items.findIndex((geometry) => geometry.id === action.line.id));
  },
};

// ---

type PinAction = {
  name: "pin";
  point: Point;
};

const PinHandler: Handler<PinAction> = {
  apply: ({ geometries }, action) => {
    geometries.items.push({ ...action.point });
  },

  undo: ({ geometries }, action) => {
    geometries.items.splice(geometries.items.findIndex((geometry) => geometry.id === action.point.id));
  },
};

// ---

type ImportGpxAction = {
  name: "importGpx";
  line: PolyLine;
};

const ImportGpxHandler: Handler<ImportGpxAction> = {
  apply: ({ geometries }, action) => {
    geometries.items.push({ ...action.line });
  },

  undo: ({ geometries }, action) => {
    geometries.items.splice(geometries.items.findIndex((geometry) => geometry.id === action.line.id));
  },
};

// ---

type NudgePinAction = {
  name: "nudgePin";
  pinId: number;
  zoom: number;
  direction: Position;

  previousCoordinates?: Coordinates;
};

const NudgePinHandler: Handler<NudgePinAction> = {
  apply: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;
    const pointCoordinates = MercatorCoordinate.fromLngLat(
      { lng: point.coordinates.longitude, lat: point.coordinates.latitude },
      0
    );
    const base = 2 ** (-action.zoom - 1);
    pointCoordinates.x += base * action.direction.x;
    pointCoordinates.y += base * action.direction.y;
    const { lat, lng } = pointCoordinates.toLngLat();

    action.previousCoordinates = point.coordinates;
    point.coordinates = { latitude: lat, longitude: lng };
  },

  undo: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    point.coordinates = action.previousCoordinates;
  },
};

// ---

type MovePinAction = {
  name: "movePin";
  pinId: number;
  coordinates: Coordinates;

  previousCoordinates?: Coordinates;
};

const MovePinHandler: Handler<MovePinAction> = {
  apply: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    action.previousCoordinates = point.coordinates;
    point.coordinates = action.coordinates;
  },

  undo: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    point.coordinates = action.previousCoordinates;
  },
};

// ---

type UpdateStyleAction = {
  name: "updateStyle";
  style: Style;

  previousStyle?: Style;
};

const UpdateStyleHandler: Handler<UpdateStyleAction> = {
  apply: ({ editor }, action) => {
    action.previousStyle = editor.style;
    editor.style = action.style;
  },

  undo: ({ editor }, action) => {
    editor.style = action.previousStyle;
  },
};

// ---

type DeleteGeometryAction = {
  name: "deleteGeometry";
  geometryId: number;

  deletedGeometry?: Geometry;
};

const DeleteGeometryHandler: Handler<DeleteGeometryAction> = {
  apply: ({ geometries }, action) => {
    const geometryIndex = geometries.items.findIndex((geometry) => geometry.id === action.geometryId);

    if (geometryIndex >= 0) {
      action.deletedGeometry = geometries.items[geometryIndex] as Geometry;
      geometries.items.splice(geometryIndex, 1);
    }
  },

  undo: ({ geometries }, action) => {
    geometries.items.push(action.deletedGeometry);
  },
};

// ---

type UpdatePinAction = {
  name: "updatePin";
  pinId: number;
  strokeColor: string;
  strokeWidth: number;
  icon: string;

  previousStyle?: {
    strokeColor: string;
    strokeWidth: number;
    icon: string;
  };
};

const UpdatePinHandler: Handler<UpdatePinAction> = {
  apply: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    action.previousStyle = point.style;

    point.style = {
      strokeWidth: action.strokeWidth,
      strokeColor: action.strokeColor,
      icon: action.icon,
    };
  },

  undo: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    point.style = action.previousStyle;
  },
};

// ---

type UpdateLineAction = {
  name: "updateLine";
  lineId: number;
  strokeColor: string;
  strokeWidth: number;

  previousStyle?: {
    strokeColor: string;
    strokeWidth: number;
  };
};

const UpdateLineHandler: Handler<UpdateLineAction> = {
  apply: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

    action.previousStyle = line.style;

    line.style = {
      strokeWidth: action.strokeWidth,
      strokeColor: action.strokeColor,
    };
  },

  undo: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

    line.style = action.previousStyle;
  },
};

// ---

type UpdateLineSmartMatchingAction = {
  name: "updateLineSmartMatching";
  lineId: number;
  smartPoints: Coordinates[];
  smartMatching: SmartMatching;

  previousState?: {
    smartPoints: Coordinates[];
    smartMatching: SmartMatching;
  };
};

const UpdateLineSmartMatchingHandler: Handler<UpdateLineSmartMatchingAction> = {
  apply: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

    action.previousState = {
      smartPoints: action.smartPoints,
      smartMatching: action.smartMatching,
    };

    line.smartMatching = action.smartMatching;
    line.smartPoints = action.smartPoints;
  },

  undo: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

    line.smartMatching = action.previousState.smartMatching;
    line.smartPoints = action.previousState.smartPoints;
  },
};

// ---

export const handlers = {
  draw: DrawHandler,
  pin: PinHandler,
  importGpx: ImportGpxHandler,
  nudgePin: NudgePinHandler,
  movePin: MovePinHandler,
  updatePin: UpdatePinHandler,
  updateLine: UpdateLineHandler,
  updateLineSmartMatching: UpdateLineSmartMatchingHandler,
  deleteGeometry: DeleteGeometryHandler,
  updateStyle: UpdateStyleHandler,
};
