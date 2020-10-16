import { State } from "~/core/app";
import { Coordinates, Geometry, ItineraryLine, Line, Point } from "~/core/geometries";
import { Place } from "~/core/itineraries";
import { PinStyle } from "~/core/pins";
import { RouteStyle } from "~/core/routes";
import { SmartMatching } from "~/lib/smartMatching";
import { Style } from "~/lib/style";

export type Handler<T extends Action> = {
  apply: (state: State, action: T) => void;
  undo: (state: State, action: Required<T>) => void;
};

export type Action =
  | DrawAction
  | AddRouteStepAction
  | UpdateRouteStepAction
  | MoveRouteStepAction
  | DeleteRouteStepAction
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
  line: Line;
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
      action.previousLength = (geometries.items[lineIndex] as Line).points.length;
      geometries.items[lineIndex] = routes.currentRoute;
    }
  },

  undo: ({ geometries, routes }, action) => {
    const lineIndex = geometries.items.findIndex((line) => line.id === action.line.id);

    if (routes.currentRoute?.id !== action.line.id) {
      routes.currentRoute = action.line;
    }

    routes.currentRoute.points = routes.currentRoute.points.slice(0, action.previousLength);
    const savedLine = geometries.items[lineIndex] as Line;
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
  line: Line;
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
  style: PinStyle;

  previousStyle?: PinStyle;
};

const UpdatePinHandler: Handler<UpdatePinAction> = {
  apply: ({ geometries }, action) => {
    const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

    action.previousStyle = point.style;
    point.style = action.style;
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
  style: RouteStyle;

  previousStyle?: RouteStyle;
};

const UpdateLineHandler: Handler<UpdateLineAction> = {
  apply: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as Line;

    action.previousStyle = line.style;
    line.style = action.style;
  },

  undo: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as Line;

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
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as Line;

    action.previousState = {
      smartPoints: action.smartPoints,
      smartMatching: action.smartMatching,
    };

    line.smartMatching = action.smartMatching;
    line.smartPoints = action.smartPoints;
  },

  undo: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as Line;

    line.smartMatching = action.previousState.smartMatching;
    line.smartPoints = action.previousState.smartPoints;
  },
};

// ---

type AddRouteStepAction = {
  name: "addRouteStep";
  geometryId: number;
  place: Place;
};

const AddRouteStepActionHandler: Handler<AddRouteStepAction> = {
  apply: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.steps.push(action.place);
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.steps.splice(geometry.steps.length - 1, 1);
  },
};

// ---

type UpdateRouteStepAction = {
  name: "updateRouteStep";
  geometryId: number;
  index: number;
  place: Place;

  previousPlace?: Place;
};

const UpdateRouteStepActionHandler: Handler<UpdateRouteStepAction> = {
  apply: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    action.previousPlace = geometry.steps[action.index];
    geometry.steps[action.index] = action.place;
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.steps[action.index] = action.previousPlace;
  },
};

// ---

type MoveRouteStepAction = {
  name: "moveRouteStep";
  geometryId: number;
  from: number;
  to: number;
};

const MoveRouteStepActionHandler: Handler<MoveRouteStepAction> = {
  apply: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    const [place] = geometry.steps.splice(action.from, 1);
    geometry.steps.splice(action.to, 0, place);
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    const [place] = geometry.steps.splice(action.to, 1);
    geometry.steps.splice(action.from, 0, place);
  },
};

// ---

type DeleteRouteStepAction = {
  name: "deleteRouteStep";
  geometryId: number;
  index: number;

  place?: Place;
};

const DeleteRouteStepActionHandler: Handler<DeleteRouteStepAction> = {
  apply: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    action.place = geometry.steps[action.index];
    geometry.steps.splice(action.index, 1);
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.steps.splice(action.index, 0, action.place);
  },
};

// ---

export const handlers = {
  draw: DrawHandler,
  addRouteStep: AddRouteStepActionHandler,
  updateRouteStep: UpdateRouteStepActionHandler,
  moveRouteStep: MoveRouteStepActionHandler,
  deleteRouteStep: DeleteRouteStepActionHandler,
  pin: PinHandler,
  importGpx: ImportGpxHandler,
  movePin: MovePinHandler,
  updatePin: UpdatePinHandler,
  updateLine: UpdateLineHandler,
  updateLineSmartMatching: UpdateLineSmartMatchingHandler,
  deleteGeometry: DeleteGeometryHandler,
  updateStyle: UpdateStyleHandler,
};
