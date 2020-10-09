import { MercatorCoordinate } from "mapbox-gl";

import { State } from "~/core/app";
import { App } from "~/core/helpers";
import { Coordinates, Point, PolyLine, Position } from "~/lib/geometry";
import { SmartMatching } from "~/lib/smartMatching";
import { defaultStyle, Style } from "~/lib/style";

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

export type UnselectGeometryAction = {
  name: "unselectGeometry";
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

export type History = {
  actions: Action[];
  redoStack: Action[];
};

const initialState: History = {
  actions: [],
  redoStack: [],
};

export const history = ({ mutate }: App) => ({
  ...initialState,

  addAction: (action: Action) => {
    mutate((state) => {
      state.history.actions.push(action);
      state.history.redoStack = [];
    });
  },

  applyActions: () => {
    mutate((state) => {
      const { geometries, editor, history, line } = state;

      geometries.items = [];
      editor.style = defaultStyle as Style;

      const allActions = [...history.actions];
      if (line.currentDraw) {
        allActions.push(line.currentDraw);
      }

      allActions.forEach((action) => {
        try {
          history.applyAction(state, action);
        } catch (err) {
          console.error(err);
        }
      });
    });
  },

  applyAction: ({ geometries, editor }: State, action: Action) => {
    if (action.name === "draw") {
      geometries.items.push({ ...action.line });
    }

    if (action.name === "pin") {
      geometries.items.push({ ...action.point });
    }

    if (action.name === "importGpx") {
      geometries.items.push({ ...action.line });
    }

    if (action.name === "nudgePin") {
      const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

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
      const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

      point.coordinates = action.coordinates;
    }

    if (action.name === "updatePin") {
      const point = geometries.items.find((geometry) => geometry.id === action.pinId) as Point;

      point.style = {
        strokeWidth: action.strokeWidth,
        strokeColor: action.strokeColor,
      };
    }

    if (action.name === "updateLine") {
      const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

      line.style = {
        strokeWidth: action.strokeWidth,
        strokeColor: action.strokeColor,
      };
    }

    if (action.name === "updateLineSmartMatching") {
      const line = geometries.items.find((geometry) => geometry.id === action.lineId) as PolyLine;

      line.smartMatching = action.smartMatching;
      line.smartPoints = action.smartPoints;
    }

    if (action.name === "deleteGeometry") {
      const geometryIndex = geometries.items.findIndex((geometry) => geometry.id === action.geometryId);
      if (geometryIndex >= 0) {
        geometries.items.splice(geometryIndex, 1);
      }
    }

    if (action.name === "updateStyle") {
      editor.style = action.style;
    }
  },

  undo: () => {
    mutate(({ history }) => {
      const lastAction = history.actions.pop();
      if (!lastAction) {
        return;
      }
      history.redoStack.push(lastAction);
    });
  },

  redo: () => {
    mutate(({ history }) => {
      const lastUndoneAction = history.redoStack.pop();
      if (!lastUndoneAction) {
        return;
      }

      history.actions.push(lastUndoneAction);
    });
  },
});
