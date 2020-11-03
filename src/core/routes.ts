import { distance, Feature, LineString, lineString, Position, simplify } from "@turf/turf";

import { App } from "~/core/helpers";
import { ItineraryProfile, Place } from "~/core/itineraries";
import { getSelectedEntity, getSelectedRoutes } from "~/core/selectors";
import { ID, numericId } from "~/lib/id";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type OutlineType = "dark" | "light" | "black" | "white" | "glow" | "none";

export type DrawingMode = "freeDrawing" | "pointByPoint";

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
        source: MapSource.Routes,
        drawingMode: "pointByPoint",
        transientPoints: [],
        rawPoints: [],
        points: [],
        smartMatching: state.routes.smartMatching,
        style: state.routes.style,
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

  addRouteStep: (coordinates: Position, freeDrawing = false) => {
    get().routes.updateNextPoint(coordinates);

    mutate((state) => {
      if (!state.routes.isDrawing) {
        return;
      }

      const selectedRoute = getSelectedEntity(state) as Route;

      selectedRoute.transientPoints = [...selectedRoute.transientPoints, coordinates];
      selectedRoute.drawingMode = freeDrawing ? "freeDrawing" : "pointByPoint";
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

  stopSegment: async () => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    mutate((state) => {
      state.routes.isDrawing = false;
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
      rawPoints: selectedRoute.transientPoints,
    });
  },

  stopRoute: () => {
    mutate((state) => {
      state.routes.isDrawing = false;
    });

    if (get().editor.mode === "draw") {
      get().routes.startNewRoute();
    }
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
});
