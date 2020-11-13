import {
  ExportIcon,
  HandIcon,
  MousePointerIcon,
  PencilIcon,
  PinIcon,
  RouteIcon,
  StyleIcon,
  TextIcon,
} from "~/components/Icon";
import { App } from "~/core/helpers";
import { AspectRatio } from "~/lib/aspectRatio";
import { defaultStyle, Style } from "~/lib/style";

export type Editor = {
  mode: EditorMode;
  menuMode: EditorMenuMode | null;
  moving: boolean;
  isRouteEditing: boolean;
  readOnly: boolean;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "style" | "select" | "move" | "draw" | "itinerary" | "pin" | "text";

export type EditorMenuMode = "export" | "share";

export const modeIcons = {
  style: StyleIcon,
  export: ExportIcon,
  text: TextIcon,
  pin: PinIcon,
  itinerary: RouteIcon,
  draw: PencilIcon,
  select: MousePointerIcon,
  edit: MousePointerIcon,
  move: HandIcon,
};

export const editorInitialState: Editor = {
  mode: "move",
  menuMode: null,
  moving: true,
  isRouteEditing: false,
  readOnly: false,

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
    get().editor.setEditorMenuMode(null);

    if (mode === get().editor.mode) {
      return;
    }

    mutate((state) => {
      state.editor.mode = mode;
      state.editor.moving = mode === "move";
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

  setEditorMenuMode: (mode: EditorMenuMode | null) => {
    mutate((state) => {
      if (state.editor.mode === "move" && !state.platform.screen.dimensions.md) {
        state.editor.mode = "select";
      }

      state.editor.menuMode = state.editor.menuMode !== mode ? mode : null;
    });
  },

  setReadOnly: (readOnly: boolean) => {
    mutate((state) => {
      state.editor.readOnly = readOnly;
    });

    if (readOnly) {
      get().editor.setEditorMode("move");
    }
  },

  toggleMoving: (moving: boolean) => {
    mutate((state) => {
      state.editor.moving = moving;
    });
  },

  toggleEditing: (editing: boolean) => {
    mutate((state) => {
      state.editor.isRouteEditing = editing;
    });
  },
});
