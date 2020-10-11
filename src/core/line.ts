import { nextGeometryId, PolyLine } from "~/core/geometries";
import { App } from "~/core/helpers";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/lib/sources";

export type Line = {
  currentLine: PolyLine | null;
};

const initialState: Line = {
  currentLine: null,
};

export const line = ({ mutate, get }: App) => ({
  ...initialState,

  startDrawing: () => {
    const { editor } = get();

    mutate(({ line }) => {
      line.currentLine = {
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
      };
    });
  },

  draw: (latitude: number, longitude: number) => {
    mutate(({ line }) => {
      if (!line.currentLine) {
        return;
      }

      line.currentLine.points.push({ latitude, longitude });
    });
  },

  endDrawing: async () => {
    const { line, history } = get();

    if (!line.currentLine) {
      return;
    }

    if (line.currentLine.points.length === 0) {
      return;
    }

    const smartPoints = line.currentLine.smartMatching.enabled
      ? await smartMatch(line.currentLine, line.currentLine.smartMatching.profile as SmartMatchingProfile)
      : [];

    history.push({
      name: "draw",
      line: {
        ...line.currentLine,
        smartPoints,
      },
    });

    mutate(({ line }) => {
      line.currentLine = null;
    });
  },

  transientUpdateSelectedLine: (strokeColor: string, strokeWidth: number) => {
    mutate(({ geometries, selection }) => {
      const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as PolyLine;

      line.transientStyle = {
        strokeColor,
        strokeWidth,
      };
    });
  },

  updateSelectedLine: (strokeColor: string, strokeWidth: number) => {
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

    history.push({
      name: "updateLineSmartMatching",
      lineId: selectedGeometry.id,
      smartMatching,
      smartPoints,
    });
  },
});
