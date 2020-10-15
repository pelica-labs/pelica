import { State } from "~/core/app";
import { Coordinates, Geometry, Point, PolyLine } from "~/core/geometries";
import { OutlineType } from "~/core/routes";
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
  | MovePinAction
  | UpdatePinAction
  | UpdateLineAction
  | UpdateLineSmartMatchingAction
  | DeleteGeometryAction;

// ---

type DrawAction = {
  name: "draw";
  line: PolyLine;
  previousLength?: number;
};

const DrawHandler: Handler<DrawAction> = {
  apply: ({ geometries, routes }, action) => {
    routes.currentRoute = action.line;

    const lineIndex = geometries.items.findIndex((line) => line.id === action.line.id);

    if (lineIndex === -1) {
      action.previousLength = 0;
      geometries.items.push(action.line);
    } else {
      action.previousLength = (geometries.items[lineIndex] as PolyLine).points.length;
      geometries.items[lineIndex] = routes.currentRoute;
    }
  },

  undo: ({ geometries, routes }, action) => {
    const lineIndex = geometries.items.findIndex((line) => line.id === action.line.id);

    if (routes.currentRoute?.id !== action.line.id) {
      routes.currentRoute = action.line;
    }

    routes.currentRoute.points = routes.currentRoute.points.slice(0, action.previousLength);
    const savedLine = geometries.items[lineIndex] as PolyLine;
    savedLine.points = savedLine.points.slice(0, action.previousLength);

    if (action.previousLength === 0) {
      routes.currentRoute = null;
      geometries.items.splice(lineIndex, 1);
    }
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
  color: string;
  width: number;
  icon: string;

  previousStyle?: {
    color: string;
    width: number;
    icon: string;
  };
};

const UpdatePinHandler: Handler<UpdatePinAction> = {
  apply: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    action.previousStyle = point.style;

    point.style = {
      width: action.width,
      color: action.color,
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
  color: string;
  width: number;
  outline: OutlineType;

  previousStyle?: {
    color: string;
    width: number;
    outline: OutlineType;
  };
};

const UpdateLineHandler: Handler<UpdateLineAction> = {
  apply: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

    action.previousStyle = line.style;

    line.style = {
      width: action.width,
      color: action.color,
      outline: action.outline,
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
  movePin: MovePinHandler,
  updatePin: UpdatePinHandler,
  updateLine: UpdateLineHandler,
  updateLineSmartMatching: UpdateLineSmartMatchingHandler,
  deleteGeometry: DeleteGeometryHandler,
  updateStyle: UpdateStyleHandler,
};
