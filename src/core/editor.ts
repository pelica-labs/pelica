import { App } from "~/core/helpers";
import { AspectRatio } from "~/lib/aspectRatio";
import { SmartMatching } from "~/lib/smartMatching";
import { defaultStyle, Style } from "~/lib/style";

export type Editor = {
  mode: EditorMode;
  pane: EditorPane | null;
  smartMatching: SmartMatching;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "move" | "draw" | "pin";

export type EditorPane = "styles" | "aspectRatio" | "icons";

const initiaState: Editor = {
  mode: "move",
  pane: null,
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

  togglePane: (pane: EditorPane) => {
    mutate(({ editor }) => {
      editor.pane = editor.pane !== pane ? pane : null;
    });
  },

  setEditorMode: (mode: EditorMode) => {
    mutate(({ editor, selection, line }) => {
      editor.mode = mode;

      if (editor.mode !== "move") {
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

  closePanes: () => {
    mutate(({ editor }) => {
      editor.pane = null;
    });
  },
});
