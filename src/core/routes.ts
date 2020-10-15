import { Feature, MultiLineString, multiLineString, simplify } from "@turf/turf";

import { nextGeometryId, PolyLine } from "~/core/geometries";
import { App } from "~/core/helpers";
import { outlineColor } from "~/lib/color";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type Routes = {
  currentRoute: PolyLine | null;
  drawing: boolean;

  width: number;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  smartMatching: SmartMatching;
};

const initialState: Routes = {
  currentRoute: null,
  drawing: false,

  width: 3,
  color: theme.colors.red[500],
  outlineWidth: 1,
  outlineColor: outlineColor(theme.colors.red[500]),
  smartMatching: {
    enabled: false,
    profile: null,
  },
};

export const STOP_DRAWING_CIRCLE_ID = 999999999; // 🙉

export const routes = ({ mutate, get }: App) => ({
  ...initialState,

  setWidth: (width: number) => {
    mutate(({ routes }) => {
      routes.width = width;
    });
  },

  setColor: (color: string) => {
    mutate(({ routes }) => {
      routes.color = color;
      routes.outlineColor = outlineColor(color);
    });
  },

  setSmartMatching: (smartMatching: SmartMatching) => {
    mutate(({ routes }) => {
      routes.smartMatching = smartMatching;
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
          style: {
            color: routes.color,
            width: routes.width,
            outlineColor: routes.outlineColor,
          },
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
      routes.currentRoute = null;
    });
  },

  transientUpdateSelectedLine: (color: string, width: number) => {
    mutate(({ geometries, selection }) => {
      const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as PolyLine;

      line.transientStyle = {
        color: color,
        width: width,
        outlineColor: outlineColor(color),
      };
    });
  },

  updateSelectedLine: (color: string, width: number) => {
    const { selection, history } = get();

    if (!selection.selectedGeometryId) {
      return;
    }

    mutate(({ geometries, selection }) => {
      const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as PolyLine;

      delete line.transientStyle;
    });

    history.push({
      name: "updateLine",
      lineId: selection.selectedGeometryId,
      color: color,
      width: width,
    });
  },

  updateSelectedLineSmartMatching: async (smartMatching: SmartMatching): Promise<void> => {
    const { geometries, selection, history } = get();

    const selectedGeometry = geometries.items.find(
      (geometry) => geometry.id === selection.selectedGeometryId
    ) as PolyLine;

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
