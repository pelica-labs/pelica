import { Position } from "@turf/turf";
import { partition } from "lodash";
import { MercatorCoordinate } from "mapbox-gl";

import { State } from "~/core/app";
import { Entity } from "~/core/entities";
import { ItineraryProfile, Place } from "~/core/itineraries";
import { Pin, PinStyle } from "~/core/pins";
import { ItineraryRoute, Route, RouteStyle, RouteVertex } from "~/core/routes";
import { getEntity } from "~/core/selectors";
import { Text, TextStyle } from "~/core/texts";
import { ID } from "~/lib/id";
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
  | PlaceTextAction
  | ImportGpxAction
  | UpdateStyleAction
  | MovePinAction
  | MoveTextAction
  | UpdateTextAction
  | UpdatePinAction
  | UpdateRouteAction
  | UpdateLineSmartMatchingAction
  | DeleteEntityAction
  | InsertEntitiesAction
  | MoveRouteVertexAction
  | AddRouteVertexAction
  | DeleteRouteVertexAction;

// ---

type DrawAction = {
  name: "draw";
  routeId: ID;
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

type PlaceTextAction = {
  name: "placeText";
  text: Text;
};

const PlaceTextHandler: Handler<PlaceTextAction> = {
  apply: (state, action) => {
    state.entities.items.push(action.text);
  },

  undo: (state, action) => {
    state.entities.items.splice(state.entities.items.findIndex((entity) => entity.id === action.text.id));
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
  pinId: ID;
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

type MoveTextAction = {
  name: "moveText";
  textId: ID;
  coordinates: Position;

  previousCoordinates?: Position;
};

const MoveTextHandler: Handler<MoveTextAction> = {
  apply: (state, action) => {
    const point = state.entities.items.find((entity) => entity.id === action.textId) as Text;

    action.previousCoordinates = point.coordinates;
    point.coordinates = action.coordinates;
  },

  undo: (state, action) => {
    const point = state.entities.items.find((entity) => entity.id === action.textId) as Text;

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
  entityIds: ID[];

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
  pinIds: ID[];

  style: Partial<PinStyle>;

  previousStyles?: { [key: string]: PinStyle };
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

type UpdateTextAction = {
  name: "updateText";
  textIds: ID[];

  style: Partial<TextStyle>;

  previousStyles?: { [key: string]: TextStyle };
};

const UpdateTextHandler: Handler<UpdateTextAction> = {
  apply: (state, action) => {
    const texts = state.entities.items.filter((item): item is Text => action.textIds.includes(item.id));

    action.previousStyles = {};
    texts.forEach((text) => {
      if (!action.previousStyles) {
        return;
      }

      action.previousStyles[text.id] = { ...text.style };
      Object.assign(text.style, action.style);
    });
  },

  undo: (state, action) => {
    const texts = state.entities.items.filter((item): item is Text => action.textIds.includes(item.id));

    texts.forEach((text) => {
      text.style = action.previousStyles[text.id];
    });
  },
};

// ---

type UpdateRouteAction = {
  name: "updateRoute";
  routeIds: ID[];
  style: Partial<RouteStyle>;

  previousStyles?: { [key: string]: RouteStyle };
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
  lineId: ID;
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
  entityId: ID;
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
  entityId: ID;
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
  entityId: ID;
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
  entityId: ID;
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
  entityId: ID;
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

// ---

type MoveRouteVertexAction = {
  name: "moveRouteVertex";
  routeId: ID;
  pointIndex: number;
  coordinates: Position;

  previousCoordinates?: Position;
};

const MoveRouteVertexHandler: Handler<MoveRouteVertexAction> = {
  apply: (state, action) => {
    const route = getEntity(action.routeId, state) as Route;

    action.previousCoordinates = route.points[action.pointIndex];
    route.points[action.pointIndex] = action.coordinates;
    route.smartMatching.enabled = false;
  },

  undo: (state, action) => {
    const route = getEntity(action.routeId, state) as Route;

    route.points[action.pointIndex] = action.previousCoordinates;
  },
};

// ---

type AddRouteVertexAction = {
  name: "addRouteVertex";
  routeId: ID;
  afterPointIndex: number;
};

const AddRouteVertexHandler: Handler<AddRouteVertexAction> = {
  apply: (state, action) => {
    const route = getEntity(action.routeId, state) as Route;

    const from = MercatorCoordinate.fromLngLat(route.points[action.afterPointIndex] as [number, number]);
    const to = MercatorCoordinate.fromLngLat(route.points[action.afterPointIndex + 1] as [number, number]);

    from.x += (to.x - from.x) / 2;
    from.y += (to.y - from.y) / 2;

    route.points.splice(action.afterPointIndex + 1, 0, from.toLngLat().toArray());
    route.smartMatching.enabled = false;
  },

  undo: (state, action) => {
    const route = getEntity(action.routeId, state) as Route;

    route.points.splice(action.afterPointIndex + 1, 1);
  },
};

// ---

type DeleteRouteVertexAction = {
  name: "deleteRouteVertex";
  vertexId: ID;

  routeId?: ID;
  deletedIndex?: number;
  deletedPosition?: Position;
};

const DeleteRouteVertexHandler: Handler<DeleteRouteVertexAction> = {
  apply: (state, action) => {
    const vertex = getEntity(action.vertexId, state) as RouteVertex;
    const route = getEntity(vertex.routeId, state) as Route;

    action.routeId = route.id;
    action.deletedIndex = vertex.pointIndex;
    action.deletedPosition = route.points[vertex.pointIndex];
    route.points.splice(vertex.pointIndex, 1);
    route.smartMatching.enabled = false;
  },

  undo: (state, action) => {
    const route = getEntity(action.routeId, state) as Route;

    route.points.splice(action.deletedIndex, 0, action.deletedPosition);
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
  placeText: PlaceTextHandler,
  importGpx: ImportGpxHandler,
  movePin: MovePinHandler,
  moveText: MoveTextHandler,
  updatePin: UpdatePinHandler,
  updateText: UpdateTextHandler,
  updateRoute: UpdateRouteHandler,
  updateLineSmartMatching: UpdateLineSmartMatchingHandler,
  deleteEntity: DeleteEntityHandler,
  updateStyle: UpdateStyleHandler,
  insertEntities: InsertEntitiesHandler,
  moveRouteVertex: MoveRouteVertexHandler,
  addRouteVertex: AddRouteVertexHandler,
  deleteRouteVertex: DeleteRouteVertexHandler,
};
