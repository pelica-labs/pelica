import { App } from "~/core/helpers";
import { AspectRatio } from "~/lib/aspectRatio";
import { defaultStyle, Style } from "~/lib/style";

export type Editor = {
  mode: EditorMode;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "style" | "select" | "move" | "draw" | "itinerary" | "pin" | "text" | "export";

export const editorInitialState: Editor = {
  mode: "move",

  style: defaultStyle as Style,
  aspectRatio: "fill",
};

export const editor = ({ mutate, get }: App) => ({
  ...editorInitialState,

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

    get().selection.endArea();
    get().selection.clear();

    if (mode !== "draw") {
      get().routes.stopRoute();
    }

    if (mode !== "itinerary") {
      get().itineraries.close();
    }

    if (mode === "itinerary") {
      get().itineraries.startNewItininerary();
    }

    if (mode === "draw") {
      get().routes.startNewRoute();
    }
  },
});
