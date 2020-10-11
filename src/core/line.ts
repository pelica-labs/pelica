import { nextGeometryId, PolyLine } from "~/core/geometries";
import { App } from "~/core/helpers";
import { smartMatch, SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { MapSource } from "~/lib/sources";
import { theme } from "~/styles/tailwind";

export type Line = {
  currentLine: PolyLine | null;
  drawing: boolean;

  width: number;
  color: string;
};

const initialState: Line = {
  currentLine: null,
  drawing: false,

  width: 3,
  color: theme.colors.red[500],
};

export const STOP_DRAWING_CIRCLE_ID = 999999999; // 🙉

export const line = ({ mutate, get }: App) => ({
  ...initialState,

  setWidth: (width: number) => {
    mutate(({ line }) => {
      line.width = width;
    });
  },

  setColor: (color: string) => {
    mutate(({ line }) => {
      line.color = color;
    });
  },

  startDrawing: (latitude: number, longitude: number) => {
    const { editor } = get();

    mutate(({ line }) => {
      line.drawing = true;

      if (!line.currentLine) {
        line.currentLine = {
          type: "Line",
          id: nextGeometryId(),
          source: MapSource.Routes,
          points: [],
          smartPoints: [],
          smartMatching: editor.smartMatching,
          style: {
            color: line.color,
            width: line.width,
          },
        };
      }

      line.currentLine.points.push({ latitude, longitude });
    });
  },

  draw: (latitude: number, longitude: number) => {
    mutate(({ line }) => {
      if (!line.drawing) {
        return;
      }

      if (!line.currentLine) {
        return;
      }

      line.currentLine.points.push({ latitude, longitude });
    });
  },

  stopSegment: async () => {
    const { line, history } = get();

    mutate(({ line }) => {
      line.drawing = false;
    });

    if (!line.currentLine) {
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
  },

  stopDrawing: () => {
    mutate(({ line }) => {
      line.currentLine = null;
    });
  },

  transientUpdateSelectedLine: (color: string, width: number) => {
    mutate(({ geometries, selection }) => {
      const line = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as PolyLine;

      line.transientStyle = {
        color: color,
        width: width,
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
