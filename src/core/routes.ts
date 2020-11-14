import { circle, distance, Feature, LineString, lineString, Position, simplify } from "@turf/turf";

import { ItineraryProfile, Place } from "~/core/itineraries";
import { OutlineType } from "~/core/outlines";
import { getEntity, getSelectedEntity, getSelectedRoutes } from "~/core/selectors";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/core/smartMatching";
import { App } from "~/core/zustand";
import { ID, numericId } from "~/lib/id";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type DrawingMode = "freeDrawing" | "pointByPoint" | "circleDrawing";

export type Route = {
  id: ID;
  source: MapSource;
  type: "Route";
  transientPoints: Position[];
  rawPoints: Position[];
  points: Position[];
  smartMatching: SmartMatching;
  drawingMode?: DrawingMode;
  style: RouteStyle;
  transientStyle?: RouteStyle;
  closed: boolean;
  filled: boolean;
  itinerary?: {
    steps: Place[];
    profile: ItineraryProfile;
  };
};

export type ItineraryRoute = Route & {
  itinerary: {
    steps: Place[];
    profile: ItineraryProfile;
  };
};

export type RouteVertex = {
  id: ID;
  source: MapSource;
  type: "RouteVertex";
  coordinates: Position;
  style: RouteStyle;
  routeId: ID;
  pointIndex: number;
};

export type RouteEdge = {
  id: ID;
  source: MapSource;
  type: "RouteEdge";
  from: Position;
  to: Position;
  style: RouteStyle;
  routeId: ID;
  fromIndex: number;
  centerId: ID;
};

export type RouteEdgeCenter = {
  id: ID;
  source: MapSource;
  type: "RouteEdgeCenter";
  coordinates: Position;
  style: RouteStyle;
  routeId: ID;
  pointIndex: number;
  edgeId: ID;
};

export type RouteStyle = {
  width: number;
  color: string;
  outline: OutlineType;
};

export type Routes = {
  isDrawing: boolean;
  nextPoint: Position | null;

  style: RouteStyle;
  smartMatching: SmartMatching;

  circleMode: boolean;
  circleCenter: Position | null;
};

export const routesInitialState: Routes = {
  isDrawing: false,
  nextPoint: null,

  style: {
    width: 3,
    color: theme.colors.red[600],
    outline: "glow",
  },
  smartMatching: {
    enabled: false,
    profile: null,
  },

  circleMode: false,
  circleCenter: null,
};

export const computeDistance = (route: Route): number => {
  const points = [...route.points, ...route.transientPoints];

  if (points.length < 2) {
    return 0;
  }

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(points[i - 1], points[i]);
  }

  return total;
};

export const computeCenter = (positionA: Position, positionB: Position): Position => {
  return [(positionA[0] + positionB[0]) / 2, (positionA[1] + positionB[1]) / 2];
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const routes = ({ mutate, get }: App) => ({
  ...routesInitialState,

  setStyle: (style: Partial<RouteStyle>) => {
    mutate((state) => {
      Object.assign(state.routes.style, style);

      const selectedEntity = getSelectedEntity(state);
      if (selectedEntity?.type === "Route") {
        Object.assign(selectedEntity.style, style);
      }
    });
  },

  toggleCircleMode: () => {
    mutate((state) => {
      state.routes.circleMode = !state.routes.circleMode;
    });
  },

  setSmartMatching: (smartMatching: SmartMatching) => {
    mutate((state) => {
      state.routes.smartMatching = smartMatching;
    });

    get().routes.updateSelectedLineSmartMatching(smartMatching);
  },

  startNewRoute: () => {
    mutate((state) => {
      const id = numericId();

      state.selection.ids = [id];
      state.entities.items.push({
        type: "Route",
        id,
        source: MapSource.Route,
        drawingMode: "pointByPoint",
        transientPoints: [],
        rawPoints: [],
        points: [],
        smartMatching: state.routes.smartMatching,
        style: state.routes.style,
        closed: false,
        filled: false,
      });
    });
  },

  startRoute: (coordinates: Position) => {
    mutate((state) => {
      state.routes.isDrawing = true;

      const selectedRoute = getSelectedEntity(state) as Route;
      selectedRoute.drawingMode = "pointByPoint";
      selectedRoute.transientPoints.push(coordinates);
    });
  },

  updateNextPoint: (coordinates: Position | null) => {
    mutate((state) => {
      state.routes.nextPoint = coordinates;
    });
  },

  addRouteStep: (coordinates: Position) => {
    get().routes.updateNextPoint(coordinates);

    mutate((state) => {
      if (!state.routes.isDrawing) {
        return;
      }

      const selectedRoute = getSelectedEntity(state) as Route;
      selectedRoute.drawingMode = "freeDrawing";

      selectedRoute.transientPoints = [...selectedRoute.transientPoints, coordinates];
      if (selectedRoute.transientPoints.length <= 2) {
        return;
      }
      const feature = lineString(selectedRoute.transientPoints);
      const tolerance = 2 ** (-state.map.zoom - 1) * 0.8;
      const simplified = simplify(feature, { tolerance }) as Feature<LineString>;

      if (!simplified.geometry) {
        return;
      }

      selectedRoute.transientPoints = simplified.geometry.coordinates;
    });
  },

  updateRouteCircle: (coordinates: Position) => {
    mutate((state) => {
      const selectedRoute = getSelectedEntity(state) as Route;
      selectedRoute.drawingMode = "circleDrawing";
      selectedRoute.closed = true;
      selectedRoute.filled = true;

      if (!state.routes.circleCenter) {
        state.routes.circleCenter = coordinates;
        return;
      }

      const options = { units: "meters" } as const;
      const radius = distance(state.routes.circleCenter, coordinates, options);
      const polygon = circle(state.routes.circleCenter, radius, options);
      if (!polygon.geometry) {
        return;
      }

      selectedRoute.transientPoints = polygon.geometry.coordinates[0];
    });
  },

  stopSegment: async () => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    mutate((state) => {
      state.routes.isDrawing = false;
      state.routes.circleCenter = null;
    });

    const points = selectedRoute.smartMatching.enabled
      ? await smartMatch(
          [...selectedRoute.points.slice(-1), ...selectedRoute.transientPoints],
          selectedRoute.smartMatching.profile as SmartMatchingProfile,
          selectedRoute.drawingMode
        )
      : selectedRoute.transientPoints;

    get().history.push({
      name: "draw",
      routeId: selectedRoute.id,
      points,
      rawPoints: selectedRoute.transientPoints.slice(1),
    });

    if (selectedRoute.drawingMode === "circleDrawing") {
      get().editor.setEditorMode("select");
      get().selection.selectEntity(selectedRoute.id);
    }
  },

  stopRoute: () => {
    mutate((state) => {
      state.routes.isDrawing = false;
    });

    if (get().editor.mode === "route") {
      get().editor.setEditorMode("select");
    }
  },

  closeRoute: () => {
    mutate((state) => {
      state.routes.isDrawing = false;

      const route = getSelectedEntity(state) as Route;
      route.closed = true;
      route.filled = true;
    });

    if (get().editor.mode === "route") {
      get().editor.setEditorMode("select");
    }
  },

  toggleSelectedEntityFill: () => {
    mutate((state) => {
      const route = getSelectedEntity(state) as Route;
      route.filled = !route.filled;
    });
  },

  transientUpdateSelectedLine: (style: Partial<RouteStyle>) => {
    mutate((state) => {
      getSelectedRoutes(state).forEach((route) => {
        if (!route.transientStyle) {
          route.transientStyle = route.style;
        }

        Object.assign(route.transientStyle, style);
      });
    });
  },

  updateSelectedLine: (style: Partial<RouteStyle>) => {
    mutate((state) => {
      getSelectedRoutes(state).forEach((route) => {
        delete route.transientStyle;
      });
    });

    const selectedRoutes = getSelectedRoutes(get());
    get().history.push({
      name: "updateRoute",
      routeIds: selectedRoutes.map((route) => route.id),
      style,
    });
  },

  updateSelectedLineSmartMatching: async (smartMatching: SmartMatching): Promise<void> => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    const points = smartMatching.enabled
      ? await smartMatch(
          selectedRoute.rawPoints,
          smartMatching.profile as SmartMatchingProfile,
          selectedRoute.drawingMode
        )
      : selectedRoute.rawPoints;

    get().history.push({
      name: "updateLineSmartMatching",
      lineId: selectedRoute.id,
      smartMatching,
      points,
    });
  },

  insertPoint: (edgeCenterId: ID) => {
    const edgeCenter = getEntity(edgeCenterId, get()) as RouteEdgeCenter;

    get().history.push({
      name: "addRouteVertex",
      routeId: edgeCenter.routeId,
      pointIndex: edgeCenter.pointIndex,
    });
  },

  deletePoint: (vertexId: ID) => {
    const vertex = getEntity(vertexId, get()) as RouteVertex;
    const route = getEntity(vertex.routeId, get()) as Route;

    if (route.points.length > 2) {
      get().history.push({
        name: "deleteRouteVertex",
        vertexId: vertex.id,
      });
    }
  },
});
