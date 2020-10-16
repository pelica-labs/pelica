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
    if (mode === get().editor.mode) {
      return;
    }

    mutate((state) => {
      state.editor.mode = mode;
    });

    if (mode !== "select") {
      get().selection.unselectGeometry();
    }

    if (mode !== "draw") {
      get().routes.stopDrawing();
    }

    if (mode !== "itinerary") {
      get().itineraries.close();
    }

    if (mode === "itinerary") {
      get().itineraries.startNewItininerary();
    }
  },
});
