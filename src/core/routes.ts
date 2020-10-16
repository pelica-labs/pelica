import { Feature, MultiLineString, multiLineString, simplify } from "@turf/turf";

import { Coordinates, Line, nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type OutlineType = "dark" | "light" | "black" | "none";

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
    mutate((state) => {
      Object.assign(state.routes.style, style);

      const selectedGeometry = state.geometries.items.find((item) => item.id === state.selection.selectedGeometryId);
      if (selectedGeometry?.type === "Line") {
        Object.assign(selectedGeometry.style, style);
      }
    });
  },

  setSmartMatching: (smartMatching: SmartMatching) => {
    mutate((state) => {
      state.routes.smartMatching = smartMatching;

      const selectedGeometry = state.geometries.items.find((item) => item.id === state.selection.selectedGeometryId);
      if (selectedGeometry?.type === "Line") {
        selectedGeometry.smartMatching = smartMatching;
      }
    });
  },

  startNewRoute: () => {
    mutate((state) => {
      state.selection.selectedGeometryId = nextGeometryId();
      state.geometries.items.push({
        type: "Line",
        id: state.selection.selectedGeometryId,
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

      const geometry = state.geometries.items.find((item) => item.id === state.selection.selectedGeometryId) as Line;

      geometry.transientPoints.push(coordinates);
    });
  },

  addRouteStep: (coordinates: Coordinates) => {
    mutate((state) => {
      if (!state.routes.isDrawing) {
        return;
      }

      const geometry = state.geometries.items.find((item) => item.id === state.selection.selectedGeometryId) as Line;

      geometry.transientPoints = [...geometry.transientPoints, coordinates];

      if (geometry.transientPoints.length <= 2) {
        return;
      }
      const feature = multiLineString([
        geometry.transientPoints.map((point) => {
          return [point.longitude, point.latitude];
        }),
      ]);
      const tolerance = 2 ** (-state.map.zoom - 1) * 0.8;
      const simplified = simplify(feature, { tolerance }) as Feature<MultiLineString>;

      if (!simplified.geometry) {
        return;
      }

      geometry.transientPoints = simplified.geometry.coordinates[0].map((point) => {
        return { latitude: point[1], longitude: point[0] };
      });
    });
  },

  stopSegment: async () => {
    mutate((state) => {
      state.routes.isDrawing = false;
    });

    const geometry = get().geometries.items.find((item) => item.id === get().selection.selectedGeometryId) as Line;

    const points = geometry.smartMatching.enabled
      ? await smartMatch(geometry.transientPoints, geometry.smartMatching.profile as SmartMatchingProfile)
      : geometry.transientPoints;

    get().history.push({
      name: "draw",
      geometryId: geometry.id,
      points,
      rawPoints: geometry.transientPoints,
    });
  },

  stopRoute: () => {
    mutate(({ routes }) => {
      routes.isDrawing = false;
    });

    get().routes.startNewRoute();
  },

  transientUpdateSelectedLine: (style: Partial<RouteStyle>) => {
    mutate(({ geometries, selection }) => {
      const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Line;

      if (!line.transientStyle) {
        line.transientStyle = line.style;
      }

      Object.assign(line.transientStyle, style);
    });
  },

  updateSelectedLine: (style: Partial<RouteStyle>) => {
    const { selection, history, geometries } = get();

    if (!selection.selectedGeometryId) {
      return;
    }

    mutate(({ geometries, selection }) => {
      const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Line;

      delete line.transientStyle;
    });

    const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Line;

    history.push({
      name: "updateLine",
      lineId: selection.selectedGeometryId,
      style: {
        ...line.style,
        ...style,
      },
    });
  },

  updateSelectedLineSmartMatching: async (smartMatching: SmartMatching): Promise<void> => {
    const { geometries, selection, history } = get();

    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Line;

    if (selectedGeometry?.type !== "Line") {
      return;
    }

    const points = smartMatching.enabled
      ? await smartMatch(selectedGeometry.rawPoints, smartMatching.profile as SmartMatchingProfile)
      : selectedGeometry.rawPoints;

    history.push({
      name: "updateLineSmartMatching",
      lineId: selectedGeometry.id,
      smartMatching,
      points,
    });
  },
});
