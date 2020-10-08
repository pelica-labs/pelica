import { App } from "~/core/helpers";
import { AspectRatio } from "~/lib/aspectRatio";
import { SmartMatching } from "~/lib/smartMatching";
import { defaultStyle, Style } from "~/lib/style";
import { theme } from "~/styles/tailwind";

export type Editor = {
  strokeColor: string;
  strokeWidth: number;
  mode: EditorMode;
  pane: EditorPane | null;
  smartMatching: SmartMatching;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "move" | "draw" | "pin";

export type EditorPane = "styles" | "aspectRatio";

const initiaState: Editor = {
  strokeColor: theme.colors.red[500],
  strokeWidth: 5,
  mode: "move",
  pane: null,
  smartMatching: {
    enabled: true,
    profile: "walking",
  },
  style: defaultStyle as Style,
  aspectRatio: "fill",
};

export const editor = ({ mutate, get }: App) => ({
  ...initiaState,

  setStrokeColor: (strokeColor: string) => {
    mutate(({ editor }) => {
      editor.strokeColor = strokeColor;
    });
  },

  setStrokeWidth: (strokeWidth: number) => {
    mutate(({ editor }) => {
      editor.strokeWidth = strokeWidth;
    });
  },

  setStyle: (style: Style) => {
    const { history } = get();

    history.addAction({
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
    mutate(({ editor, selection }) => {
      editor.mode = mode;

      if (editor.mode !== "move") {
        selection.selectedGeometryId = null;
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
