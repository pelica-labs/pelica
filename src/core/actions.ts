import { State } from "~/core/app";
import { Coordinates, Geometry, ItineraryLine, Line, Point } from "~/core/geometries";
import { ItineraryProfile, Place } from "~/core/itineraries";
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
  | UpdateRouteProfileAction
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
  geometryId: number;
  rawPoints: Coordinates[];
  points: Coordinates[];

  previousLength?: number;
};

const DrawHandler: Handler<DrawAction> = {
  apply: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as Line;

    action.previousLength = geometry.points.length;

    geometry.rawPoints.push(...action.rawPoints);
    geometry.points.push(...action.points);
    geometry.transientPoints = [];

    state.selection.selectedGeometryId = geometry.id;
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as Line;

    geometry.points = geometry.points.slice(0, action.previousLength);
    geometry.rawPoints = geometry.rawPoints.slice(0, action.previousLength);

    if (action.previousLength) {
      state.selection.selectedGeometryId = geometry.id;
    }
  },
};

// ---

type PinAction = {
  name: "pin";
  point: Point;
};

const PinHandler: Handler<PinAction> = {
  apply: (state, action) => {
    state.geometries.items.push(action.point);
  },

  undo: (state, action) => {
    state.geometries.items.splice(state.geometries.items.findIndex((geometry) => geometry.id === action.point.id));
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
  points: Coordinates[];
  smartMatching: SmartMatching;

  previousState?: {
    points: Coordinates[];
    smartMatching: SmartMatching;
  };
};

const UpdateLineSmartMatchingHandler: Handler<UpdateLineSmartMatchingAction> = {
  apply: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as Line;

    action.previousState = {
      points: action.points,
      smartMatching: action.smartMatching,
    };

    line.smartMatching = action.smartMatching;
    line.points = action.points;
  },

  undo: ({ geometries }, action) => {
    const line = geometries.items.find((geometry) => geometry.id === action.lineId) as Line;

    line.smartMatching = action.previousState.smartMatching;
    line.points = action.previousState.points;
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

    geometry.itinerary.steps.push(action.place);
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.itinerary.steps.splice(geometry.itinerary.steps.length - 1, 1);
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

    action.previousPlace = geometry.itinerary.steps[action.index];
    geometry.itinerary.steps[action.index] = action.place;
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.itinerary.steps[action.index] = action.previousPlace;
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

    const [place] = geometry.itinerary.steps.splice(action.from, 1);
    geometry.itinerary.steps.splice(action.to, 0, place);
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    const [place] = geometry.itinerary.steps.splice(action.to, 1);
    geometry.itinerary.steps.splice(action.from, 0, place);
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

    action.place = geometry.itinerary.steps[action.index];
    geometry.itinerary.steps.splice(action.index, 1);
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.itinerary.steps.splice(action.index, 0, action.place);
  },
};

// ---

type UpdateRouteProfileAction = {
  name: "updateRouteProfile";
  geometryId: number;
  profile: ItineraryProfile;

  previousProfile?: ItineraryProfile;
};

const UpdateRouteProfileActionHandler: Handler<UpdateRouteProfileAction> = {
  apply: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    action.previousProfile = geometry.itinerary.profile;
    geometry.itinerary.profile = action.profile;
  },

  undo: (state, action) => {
    const geometry = state.geometries.items.find((item) => item.id === action.geometryId) as ItineraryLine;

    geometry.itinerary.profile = action.previousProfile;
  },
};

// ---

export const handlers = {
  draw: DrawHandler,
  addRouteStep: AddRouteStepActionHandler,
  updateRouteStep: UpdateRouteStepActionHandler,
  moveRouteStep: MoveRouteStepActionHandler,
  deleteRouteStep: DeleteRouteStepActionHandler,
  updateRouteProfile: UpdateRouteProfileActionHandler,
  pin: PinHandler,
  importGpx: ImportGpxHandler,
  movePin: MovePinHandler,
  updatePin: UpdatePinHandler,
  updateLine: UpdateLineHandler,
  updateLineSmartMatching: UpdateLineSmartMatchingHandler,
  deleteGeometry: DeleteGeometryHandler,
  updateStyle: UpdateStyleHandler,
};
