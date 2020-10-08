import { App } from "~/core/helpers";
import { DrawAction } from "~/core/history";
import { nextGeometryId, PolyLine } from "~/lib/geometry";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/lib/sources";

export type Line = {
  currentDraw: DrawAction | null;
};

const initialState: Line = {
  currentDraw: null,
};

export const line = ({ mutate, get }: App) => ({
  ...initialState,

  startDrawing: () => {
    const { editor } = get();

    mutate(({ line: draw }) => {
      draw.currentDraw = {
        name: "draw",
        line: {
          type: "PolyLine",
          id: nextGeometryId(),
          source: MapSource.Routes,
          points: [],
          smartPoints: [],
          smartMatching: editor.smartMatching,
          style: {
            strokeColor: editor.strokeColor,
            strokeWidth: editor.strokeWidth,
          },
        },
      };
    });
  },

  draw: (latitude: number, longitude: number) => {
    mutate(({ line: draw }) => {
      if (!draw.currentDraw) {
        return;
      }

      draw.currentDraw.line.points.push({ latitude, longitude });
    });
  },

  endDrawing: async () => {
    const { currentDraw } = get().line;

    if (!currentDraw) {
      return;
    }

    if (currentDraw.line.points.length === 0) {
      return;
    }

    const smartPoints = currentDraw.line.smartMatching.enabled
      ? await smartMatch(currentDraw.line, currentDraw.line.smartMatching.profile as SmartMatchingProfile)
      : [];

    mutate(({ history, line: draw }) => {
      history.actions.push({
        ...currentDraw,
        line: {
          ...currentDraw.line,
          smartPoints,
        },
      });
      draw.currentDraw = null;
    });
  },

  updateSelectedLine: (strokeColor: string, strokeWidth: number) => {
    mutate(({ geometries, selection, history }) => {
      const selectedGeometry = geometries.items.find(
        (geometry) => geometry.id === selection.selectedGeometryId
      ) as PolyLine;

      history.actions.push({
        name: "updateLine",
        lineId: selectedGeometry.id,
        strokeColor,
        strokeWidth,
      });
    });
  },

  updateSelectedLineSmartMatching: async (smartMatching: SmartMatching): Promise<void> => {
    const selectedGeometry = get().geometries.items.find(
      (geometry) => geometry.id === get().selection.selectedGeometryId
    ) as PolyLine;

    if (selectedGeometry?.type !== "PolyLine") {
      return;
    }

    const smartPoints = smartMatching.enabled
      ? await smartMatch(selectedGeometry, smartMatching.profile as SmartMatchingProfile)
      : [];

    mutate(({ history }) => {
      history.actions.push({
        name: "updateLineSmartMatching",
        lineId: selectedGeometry.id,
        smartMatching,
        smartPoints,
      });
    });
  },
});
