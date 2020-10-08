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

    mutate(({ line }) => {
      line.currentDraw = {
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
    mutate(({ line }) => {
      if (!line.currentDraw) {
        return;
      }

      line.currentDraw.line.points.push({ latitude, longitude });
    });
  },

  endDrawing: async () => {
    const { line, history } = get();

    if (!line.currentDraw) {
      return;
    }

    if (line.currentDraw.line.points.length === 0) {
      return;
    }

    const smartPoints = line.currentDraw.line.smartMatching.enabled
      ? await smartMatch(line.currentDraw.line, line.currentDraw.line.smartMatching.profile as SmartMatchingProfile)
      : [];

    history.addAction({
      ...line.currentDraw,
      line: {
        ...line.currentDraw.line,
        smartPoints,
      },
    });

    mutate(({ line }) => {
      line.currentDraw = null;
    });
  },

  updateSelectedLine: (strokeColor: string, strokeWidth: number) => {
    const { geometries, selection, history } = get();
    const selectedGeometry = geometries.items.find(
      (geometry) => geometry.id === selection.selectedGeometryId
    ) as PolyLine;

    history.addAction({
      name: "updateLine",
      lineId: selectedGeometry.id,
      strokeColor,
      strokeWidth,
    });
  },

  updateSelectedLineSmartMatching: async (smartMatching: SmartMatching): Promise<void> => {
    const { geometries, selection, history } = get();

    const selectedGeometry = geometries.items.find(
      (geometry) => geometry.id === selection.selectedGeometryId
    ) as PolyLine;

    if (selectedGeometry?.type !== "PolyLine") {
      return;
    }

    const smartPoints = smartMatching.enabled
      ? await smartMatch(selectedGeometry, smartMatching.profile as SmartMatchingProfile)
      : [];

    history.addAction({
      name: "updateLineSmartMatching",
      lineId: selectedGeometry.id,
      smartMatching,
      smartPoints,
    });
  },
});
