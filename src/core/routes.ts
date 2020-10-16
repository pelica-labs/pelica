import { Feature, MultiLineString, multiLineString, simplify } from "@turf/turf";

import { Line, nextGeometryId } from "~/core/geometries";
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
  currentRoute: Line | null;
  drawing: boolean;

  style: RouteStyle;
  smartMatching: SmartMatching;
};

const initialState: Routes = {
  currentRoute: null,
  drawing: false,

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
    mutate(({ routes }) => {
      Object.assign(routes.style, style);

      if (routes.currentRoute) {
        Object.assign(routes.currentRoute.style, style);
      }
    });
  },

  setSmartMatching: (smartMatching: SmartMatching) => {
    mutate(({ routes }) => {
      routes.smartMatching = smartMatching;

      if (routes.currentRoute) {
        routes.currentRoute.smartMatching = smartMatching;
      }
    });
  },

  startDrawing: (latitude: number, longitude: number) => {
    mutate(({ routes }) => {
      routes.drawing = true;

      if (!routes.currentRoute) {
        routes.currentRoute = {
          type: "Line",
          id: nextGeometryId(),
          source: MapSource.Routes,
          points: [],
          smartPoints: [],
          smartMatching: routes.smartMatching,
          style: routes.style,
        };
      }

      routes.currentRoute.points.push({ latitude, longitude });
    });
  },

  draw: (latitude: number, longitude: number) => {
    mutate(({ routes, map }) => {
      if (!routes.drawing) {
        return;
      }

      if (!routes.currentRoute) {
        return;
      }

      routes.currentRoute.points.push({ latitude, longitude });

      if (routes.currentRoute.points.length <= 2) {
        return;
      }

      const feature = multiLineString([
        routes.currentRoute.points.map((point) => {
          return [point.longitude, point.latitude];
        }),
      ]);
      const tolerance = 2 ** (-map.zoom - 1) * 0.8;
      const simplified = simplify(feature, { tolerance }) as Feature<MultiLineString>;

      if (!simplified.geometry) {
        return;
      }

      routes.currentRoute.points = simplified.geometry.coordinates[0].map((point) => {
        return { latitude: point[1], longitude: point[0] };
      });
    });
  },

  stopSegment: async () => {
    mutate(({ routes }) => {
      routes.drawing = false;
    });

    const { routes, history } = get();

    if (!routes.currentRoute) {
      return;
    }

    const smartPoints = routes.currentRoute.smartMatching.enabled
      ? await smartMatch(routes.currentRoute, routes.currentRoute.smartMatching.profile as SmartMatchingProfile)
      : [];

    history.push({
      name: "draw",
      line: {
        ...routes.currentRoute,
        smartPoints,
      },
    });
  },

  stopDrawing: () => {
    mutate(({ routes }) => {
      routes.drawing = false;
      routes.currentRoute = null;
    });
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

    const smartPoints = smartMatching.enabled
      ? await smartMatch(selectedGeometry, smartMatching.profile as SmartMatchingProfile)
      : [];

    history.push({
      name: "updateLineSmartMatching",
      lineId: selectedGeometry.id,
      smartMatching,
      smartPoints,
    });
  },
});
