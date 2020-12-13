import {
  FilmIcon,
  HandIcon,
  MountainIcon,
  MousePointerIcon,
  PencilIcon,
  PinIcon,
  RouteIcon,
  StyleIcon,
  TextIcon,
} from "~/components/ui/Icon";
import { AspectRatio } from "~/core/aspectRatio";
import { App } from "~/core/zustand";
import { defaultStyle, Style } from "~/map/style";

export type Editor = {
  mode: EditorMode;
  menuMode: EditorMenuMode | null;
  isMoving: boolean;
  isRouteEditing: boolean;
  isReadOnly: boolean;
  style: Style;
  aspectRatio: AspectRatio;
};

export type EditorMode = "select" | "move" | "route" | "itinerary" | "pin" | "text" | "style" | "3d" | "scenes";

export type EditorMenuMode = "export" | "share";

export const modeIcons = {
  "select": MousePointerIcon,
  "move": HandIcon,
  "route": PencilIcon,
  "itinerary": RouteIcon,
  "pin": PinIcon,
  "text": TextIcon,
  "style": StyleIcon,
  "3d": MountainIcon,
  "scenes": FilmIcon,
};

export const editorInitialState: Editor = {
  mode: "style",
  menuMode: null,
  isMoving: true,
  isRouteEditing: false,
  isReadOnly: false,

  style: defaultStyle as Style,
  aspectRatio: "fill",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
      state.editor.isMoving = mode === "move";
    });

    get().selection.endArea();
    get().selection.clear();

    if (mode !== "route") {
      get().routes.stopRoute();
    }

    if (mode !== "itinerary") {
      get().itineraries.close();
    }

    if (mode === "itinerary") {
      get().itineraries.startNewItininerary();
    }

    if (mode === "route") {
      get().routes.startNewRoute();
    }
  },

  setEditorMenuMode: (mode: EditorMenuMode | null) => {
    mutate((state) => {
      if (state.editor.mode === "move" && !state.platform.screen.dimensions.md) {
        state.editor.mode = "select";
      }

      state.editor.mode = "move";
      state.editor.menuMode = state.editor.menuMode !== mode ? mode : null;
    });
  },

  setReadOnly: (isReadOnly: boolean) => {
    mutate((state) => {
      state.editor.isReadOnly = isReadOnly;
    });

    if (isReadOnly) {
      get().editor.setEditorMode("move");
    }
  },

  toggleMoving: (isMoving: boolean) => {
    mutate((state) => {
      state.editor.isMoving = isMoving;
    });
  },

  toggleEditing: (isRouteEditing: boolean) => {
    mutate((state) => {
      state.editor.isRouteEditing = isRouteEditing;
    });
  },
});
