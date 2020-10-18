import { Feature, MultiLineString, multiLineString, simplify } from "@turf/turf";

import { Coordinates, Line, nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { getSelectedGeometry } from "~/core/selectors";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type OutlineType = "dark" | "light" | "black" | "glow" | "none";

export type RouteStyle = {
  width: number;
  color: string;
  outline: OutlineType;
};

export type Routes = {
  isDrawing: boolean;

  style: RouteStyle;
  smartMatching: SmartMatching;
};

const initialState: Routes = {
  isDrawing: false,

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

export const routes = ({ mutate, get }: App) => ({
  ...initialState,

  setStyle: (style: Partial<RouteStyle>) => {
    const selectedGeometry = getSelectedGeometry(get());

    mutate((state) => {
      Object.assign(state.routes.style, style);

      if (selectedGeometry?.type === "Line") {
        Object.assign(selectedGeometry.style, style);
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
      const id = nextGeometryId();

      state.selection.ids = [id];
      state.geometries.items.push({
        type: "Line",
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

  startRoute: (coordinates: Coordinates) => {
    mutate((state) => {
      state.routes.isDrawing = true;

      const selectedRoute = getSelectedGeometry(state) as Line;

      selectedRoute.transientPoints.push(coordinates);
    });
  },

  addRouteStep: (coordinates: Coordinates) => {
    mutate((state) => {
      if (!state.routes.isDrawing) {
        return;
      }

      const selectedRoute = getSelectedGeometry(state) as Line;

      selectedRoute.transientPoints = [...selectedRoute.transientPoints, coordinates];

      if (selectedRoute.transientPoints.length <= 2) {
        return;
      }
      const feature = multiLineString([
        selectedRoute.transientPoints.map((point) => {
          return [point.longitude, point.latitude];
        }),
      ]);
      const tolerance = 2 ** (-state.map.zoom - 1) * 0.8;
      const simplified = simplify(feature, { tolerance }) as Feature<MultiLineString>;

      if (!simplified.geometry) {
        return;
      }

      selectedRoute.transientPoints = simplified.geometry.coordinates[0].map((point) => {
        return { latitude: point[1], longitude: point[0] };
      });
    });
  },

  stopSegment: async () => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

    mutate((state) => {
      state.routes.isDrawing = false;
    });

    const points = selectedRoute.smartMatching.enabled
      ? await smartMatch(selectedRoute.transientPoints, selectedRoute.smartMatching.profile as SmartMatchingProfile)
      : selectedRoute.transientPoints;

    get().history.push({
      name: "draw",
      geometryId: selectedRoute.id,
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
      const selectedRoute = getSelectedGeometry(state) as Line;

      if (!selectedRoute.transientStyle) {
        selectedRoute.transientStyle = selectedRoute.style;
      }

      Object.assign(selectedRoute.transientStyle, style);
    });
  },

  updateSelectedLine: (style: Partial<RouteStyle>) => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

    mutate((state) => {
      const selectedRoute = getSelectedGeometry(state) as Line;

      delete selectedRoute.transientStyle;
    });

    get().history.push({
      name: "updateLine",
      lineId: selectedRoute.id,
      style: {
        ...selectedRoute.style,
        ...style,
      },
    });
  },

  updateSelectedLineSmartMatching: async (smartMatching: SmartMatching): Promise<void> => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

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
