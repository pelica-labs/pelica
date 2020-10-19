import { distance, Feature, MultiLineString, multiLineString, Position, simplify } from "@turf/turf";

import { nextEntityId } from "~/core/entities";
import { App } from "~/core/helpers";
import { ItineraryProfile, Place } from "~/core/itineraries";
import { getSelectedEntity, getSelectedRoutes } from "~/core/selectors";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type OutlineType = "dark" | "light" | "black" | "glow" | "none";

export type Route = {
  id: number;
  source: MapSource;
  type: "Route";
  transientPoints: Position[];
  rawPoints: Position[];
  points: Position[];
  smartMatching: SmartMatching;
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

const initialState: Routes = {
  isDrawing: false,
  nextPoint: null,

  style: {
    width: 3,
    color: theme.colors.red[500],
    outline: "dark",
  },
  smartMatching: {
    enabled: false,
    profile: null,
  },
};

export const STOP_DRAWING_CIRCLE_ID = 999999999; // 🙉

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
  ...initialState,

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
      const id = nextEntityId();

      state.selection.ids = [id];
      state.entities.items.push({
        type: "Route",
        id,
        source: MapSource.Routes,
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

      selectedRoute.transientPoints.push(coordinates);
    });
  },

  updateNextPoint: (coordinates: Position) => {
    mutate((state) => {
      state.routes.nextPoint = coordinates;
    });
  },

  addRouteStep: (coordinates: Position) => {
    mutate((state) => {
      if (!state.routes.isDrawing) {
        return;
      }

      const selectedRoute = getSelectedEntity(state) as Route;

      selectedRoute.transientPoints = [...selectedRoute.transientPoints, coordinates];

      if (selectedRoute.transientPoints.length <= 2) {
        return;
      }
      const feature = multiLineString([selectedRoute.transientPoints]);
      const tolerance = 2 ** (-state.map.zoom - 1) * 0.8;
      const simplified = simplify(feature, { tolerance }) as Feature<MultiLineString>;

      if (!simplified.geometry) {
        return;
      }

      selectedRoute.transientPoints = simplified.geometry.coordinates[0];
    });
  },

  stopSegment: async () => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    mutate((state) => {
      state.routes.isDrawing = false;
    });

    const points = selectedRoute.smartMatching.enabled
      ? await smartMatch(selectedRoute.transientPoints, selectedRoute.smartMatching.profile as SmartMatchingProfile)
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
      ? await smartMatch(selectedRoute.rawPoints, smartMatching.profile as SmartMatchingProfile)
      : selectedRoute.rawPoints;

    get().history.push({
      name: "updateLineSmartMatching",
      lineId: selectedRoute.id,
      smartMatching,
      points,
    });
  },
});
