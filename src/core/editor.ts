import { App } from "~/core/helpers";
import { AspectRatio } from "~/lib/aspectRatio";
import { SmartMatching } from "~/lib/smartMatching";
import { defaultStyle, Style } from "~/lib/style";

export type Editor = {
  mode: EditorMode;
  smartMatching: SmartMatching;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "style" | "select" | "draw" | "itinerary" | "pin" | "aspectRatio" | "export";

const initiaState: Editor = {
  mode: "style",
  smartMatching: {
    enabled: false,
    profile: null,
  },
  style: defaultStyle as Style,
  aspectRatio: "fill",
};

export const editor = ({ mutate, get }: App) => ({
  ...initiaState,

  setStyle: (style: Style) => {
    const { history } = get();

    history.push({
      name: "updateStyle",
      style,
    });
  },

  setAspectRatio: (aspectRatio: AspectRatio) => {
    mutate(({ editor }) => {
      editor.aspectRatio = aspectRatio;
    });
  },

  setEditorMode: (mode: EditorMode) => {
    mutate(({ editor, selection, line }) => {
      editor.mode = mode;

      if (editor.mode !== "select") {
        selection.selectedGeometryId = null;
      }

      if (editor.mode !== "draw") {
        line.currentLine = null;
      }
    });
  },

  setEditorSmartMatching: (smartMatching: SmartMatching) => {
    mutate(({ editor }) => {
      editor.smartMatching = smartMatching;
    });
  },
});
