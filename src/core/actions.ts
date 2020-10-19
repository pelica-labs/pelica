import { Position } from "@turf/turf";
import { partition } from "lodash";

import { State } from "~/core/app";
import { Entity } from "~/core/entities";
import { ItineraryProfile, Place } from "~/core/itineraries";
import { Pin, PinStyle } from "~/core/pins";
import { ItineraryRoute, Route, RouteStyle } from "~/core/routes";
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
  | UpdateRouteAction
  | UpdateLineSmartMatchingAction
  | DeleteEntityAction
  | InsertEntitiesAction;

// ---

type DrawAction = {
  name: "draw";
  routeId: number;
  rawPoints: Position[];
  points: Position[];

  previousLength?: number;
};

const DrawHandler: Handler<DrawAction> = {
  apply: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.routeId) as Route;

    action.previousLength = entity.points.length;

    entity.rawPoints.push(...action.rawPoints);
    entity.points.push(...action.points);
    entity.transientPoints = [];

    state.selection.ids = [entity.id];
  },

  undo: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.routeId) as Route;

    entity.points = entity.points.slice(0, action.previousLength);
    entity.rawPoints = entity.rawPoints.slice(0, action.previousLength);

    if (action.previousLength) {
      state.selection.ids = [entity.id];
    }
  },
};

// ---

type PinAction = {
  name: "pin";
  point: Pin;
};

const PinHandler: Handler<PinAction> = {
  apply: (state, action) => {
    state.entities.items.push(action.point);
  },

  undo: (state, action) => {
    state.entities.items.splice(state.entities.items.findIndex((entity) => entity.id === action.point.id));
  },
};

// ---

type ImportGpxAction = {
  name: "importGpx";
  route: Route;
};

const ImportGpxHandler: Handler<ImportGpxAction> = {
  apply: (state, action) => {
    state.entities.items.push(action.route);
  },

  undo: (state, action) => {
    state.entities.items.splice(state.entities.items.findIndex((entity) => entity.id === action.route.id));
  },
};

// ---

type MovePinAction = {
  name: "movePin";
  pinId: number;
  coordinates: Position;

  previousCoordinates?: Position;
};

const MovePinHandler: Handler<MovePinAction> = {
  apply: (state, action) => {
    const point = state.entities.items.find((entity) => entity.id === action.pinId) as Pin;

    action.previousCoordinates = point.coordinates;
    point.coordinates = action.coordinates;
  },

  undo: (state, action) => {
    const point = state.entities.items.find((entity) => entity.id === action.pinId) as Pin;

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

type DeleteEntityAction = {
  name: "deleteEntity";
  entityIds: number[];

  deletedEntity?: Entity[];
};

const DeleteEntityHandler: Handler<DeleteEntityAction> = {
  apply: (state, action) => {
    const [deleted, remaining] = partition(state.entities.items, (item) => {
      return action.entityIds.includes(item.id);
    });

    action.deletedEntity = deleted;
    state.entities.items = remaining;
  },

  undo: (state, action) => {
    state.entities.items.push(...action.deletedEntity);
  },
};

// ---

type UpdatePinAction = {
  name: "updatePin";
  pinIds: number[];

  style: Partial<PinStyle>;

  previousStyles?: { [key: number]: PinStyle };
};

const UpdatePinHandler: Handler<UpdatePinAction> = {
  apply: (state, action) => {
    const pins = state.entities.items.filter((item): item is Pin => action.pinIds.includes(item.id));

    action.previousStyles = {};
    pins.forEach((pin) => {
      if (!action.previousStyles) {
        return;
      }

      action.previousStyles[pin.id] = { ...pin.style };
      Object.assign(pin.style, action.style);
    });
  },

  undo: (state, action) => {
    const pins = state.entities.items.filter((item): item is Pin => action.pinIds.includes(item.id));

    pins.forEach((pin) => {
      pin.style = action.previousStyles[pin.id];
    });
  },
};

// ---

type UpdateRouteAction = {
  name: "updateRoute";
  routeIds: number[];
  style: Partial<RouteStyle>;

  previousStyles?: { [key: number]: RouteStyle };
};

const UpdateRouteHandler: Handler<UpdateRouteAction> = {
  apply: (state, action) => {
    const routes = state.entities.items.filter((item): item is Route => action.routeIds.includes(item.id));

    action.previousStyles = {};
    routes.forEach((route) => {
      if (!action.previousStyles) {
        return;
      }

      action.previousStyles[route.id] = { ...route.style };
      Object.assign(route.style, action.style);
    });
  },

  undo: (state, action) => {
    const routes = state.entities.items.filter((item): item is Route => action.routeIds.includes(item.id));

    routes.forEach((route) => {
      route.style = action.previousStyles[route.id];
    });
  },
};

// ---

type UpdateLineSmartMatchingAction = {
  name: "updateLineSmartMatching";
  lineId: number;
  points: Position[];
  smartMatching: SmartMatching;

  previousState?: {
    points: Position[];
    smartMatching: SmartMatching;
  };
};

const UpdateLineSmartMatchingHandler: Handler<UpdateLineSmartMatchingAction> = {
  apply: (state, action) => {
    const line = state.entities.items.find((entity) => entity.id === action.lineId) as Route;

    action.previousState = {
      points: action.points,
      smartMatching: action.smartMatching,
    };

    line.smartMatching = action.smartMatching;
    line.points = action.points;
  },

  undo: (state, action) => {
    const line = state.entities.items.find((entity) => entity.id === action.lineId) as Route;

    line.smartMatching = action.previousState.smartMatching;
    line.points = action.previousState.points;
  },
};

// ---

type AddRouteStepAction = {
  name: "addRouteStep";
  entityId: number;
  place: Place;
};

const AddRouteStepActionHandler: Handler<AddRouteStepAction> = {
  apply: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    entity.itinerary.steps.push(action.place);
  },

  undo: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    entity.itinerary.steps.splice(entity.itinerary.steps.length - 1, 1);
  },
};

// ---

type UpdateRouteStepAction = {
  name: "updateRouteStep";
  entityId: number;
  index: number;
  place: Place;

  previousPlace?: Place;
};

const UpdateRouteStepActionHandler: Handler<UpdateRouteStepAction> = {
  apply: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    action.previousPlace = entity.itinerary.steps[action.index];
    entity.itinerary.steps[action.index] = action.place;
  },

  undo: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    entity.itinerary.steps[action.index] = action.previousPlace;
  },
};

// ---

type MoveRouteStepAction = {
  name: "moveRouteStep";
  entityId: number;
  from: number;
  to: number;
};

const MoveRouteStepActionHandler: Handler<MoveRouteStepAction> = {
  apply: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    const [place] = entity.itinerary.steps.splice(action.from, 1);
    entity.itinerary.steps.splice(action.to, 0, place);
  },

  undo: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    const [place] = entity.itinerary.steps.splice(action.to, 1);
    entity.itinerary.steps.splice(action.from, 0, place);
  },
};

// ---

type DeleteRouteStepAction = {
  name: "deleteRouteStep";
  entityId: number;
  index: number;

  place?: Place;
};

const DeleteRouteStepActionHandler: Handler<DeleteRouteStepAction> = {
  apply: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    action.place = entity.itinerary.steps[action.index];
    entity.itinerary.steps.splice(action.index, 1);
  },

  undo: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    entity.itinerary.steps.splice(action.index, 0, action.place);
  },
};

// ---

type UpdateRouteProfileAction = {
  name: "updateRouteProfile";
  entityId: number;
  profile: ItineraryProfile;

  previousProfile?: ItineraryProfile;
};

const UpdateRouteProfileActionHandler: Handler<UpdateRouteProfileAction> = {
  apply: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    action.previousProfile = entity.itinerary.profile;
    entity.itinerary.profile = action.profile;
  },

  undo: (state, action) => {
    const entity = state.entities.items.find((item) => item.id === action.entityId) as ItineraryRoute;

    entity.itinerary.profile = action.previousProfile;
  },
};

// ---

type InsertEntitiesAction = {
  name: "insertEntities";
  entities: Entity[];
};

const InsertEntitiesHandler: Handler<InsertEntitiesAction> = {
  apply: (state, action) => {
    state.entities.items.push(...action.entities);
  },

  undo: (state, action) => {
    state.entities.items = state.entities.items.filter((entity) => {
      return !action.entities.find((entityToDelete) => entityToDelete.id === entity.id);
    });
  },
};

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
  updateRoute: UpdateRouteHandler,
  updateLineSmartMatching: UpdateLineSmartMatchingHandler,
  deleteEntity: DeleteEntityHandler,
  updateStyle: UpdateStyleHandler,
  insertEntities: InsertEntitiesHandler,
};
