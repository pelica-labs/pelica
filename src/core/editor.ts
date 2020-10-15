import { App } from "~/core/helpers";
import { AspectRatio } from "~/lib/aspectRatio";
import { defaultStyle, Style } from "~/lib/style";

export type Editor = {
  mode: EditorMode;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "style" | "select" | "draw" | "itinerary" | "pin" | "aspectRatio" | "export";

const initiaState: Editor = {
  mode: "style",

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
    mutate(({ editor, selection, routes }) => {
      editor.mode = mode;

      if (editor.mode !== "select") {
        selection.selectedGeometryId = null;
      }

      if (editor.mode !== "draw") {
        routes.currentRoute = null;
      }
    });
  },
});
