import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Style } from "@mapbox/mapbox-sdk/services/styles";

import { createStore, immer } from "~/lib/zustand";

export type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  place?: GeocodeFeature | null;
  style?: Style | null;
  editor: {
    strokeColor: string;
    strokeWidth: number;
    mode: EditorMode;
    pane: EditorPane | null;
    isPainting: boolean;
  };
  currentRoute: RouteState | null;
  routes: RouteState[];
};

export type RouteState = {
  markers: MarkerState[];
};

export type MarkerState = {
  strokeColor: string;
  strokeWidth: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type EditorMode = "moving" | "drawing" | "painting";

export type EditorPane = "styles" | "colors" | "strokeWidth";

type MapStore = ReturnType<typeof makeStore> & MapState;

const makeStore = (set: (fn: (draft: MapState) => void) => void) => {
  return {
    coordinates: {
      latitude: 40,
      longitude: -74.5,
    },
    zoom: 9,
    editor: {
      strokeColor: "black",
      strokeWidth: 3,
      mode: "moving" as EditorMode,
      isPainting: false,
      pane: null,
    },
    currentRoute: null,
    routes: [],

    move(latitude: number, longitude: number, zoom: number) {
      set((state) => {
        state.coordinates.latitude = latitude;
        state.coordinates.longitude = longitude;
        state.zoom = zoom;
      });
    },

    setPlace(place: GeocodeFeature | null) {
      set((state) => {
        state.place = place;
      });
    },

    setStyle(style: Style) {
      set((state) => {
        state.style = style;
      });
    },

    setStrokeColor(strokeColor: string) {
      set((state) => {
        state.editor.strokeColor = strokeColor;
      });
    },

    setStrokeWidth(strokeWidth: number) {
      set((state) => {
        state.editor.strokeWidth = strokeWidth;
      });
    },

    togglePane(pane: EditorPane) {
      set((state) => {
        state.editor.pane = state.editor.pane !== pane ? pane : null;
      });
    },

    setEditorMode(mode: EditorMode) {
      set((state) => {
        if (state.editor.mode === "drawing" && state.currentRoute) {
          state.routes.push(state.currentRoute);
          state.currentRoute = null;
        }

        state.editor.mode = mode;
      });
    },

    togglePainting(painting?: boolean) {
      set((state) => {
        state.editor.isPainting = painting ?? !state.editor.isPainting;
      });
    },

    startRoute() {
      set((state) => {
        state.currentRoute = {
          markers: [],
        };
      });
    },

    endRoute() {
      set((state) => {
        if (!state.currentRoute) {
          return;
        }

        state.routes.push(state.currentRoute);
        state.currentRoute = null;
      });
    },

    addMarker(latitude: number, longitude: number) {
      set((state) => {
        let lastRoute = state.routes[state.routes.length - 1];
        if (!lastRoute) {
          lastRoute = { markers: [] };
          state.routes.push(lastRoute);
        }

        lastRoute.markers.push({
          coordinates: {
            latitude,
            longitude,
          },
          strokeColor: state.editor.strokeColor,
          strokeWidth: state.editor.strokeWidth,
        });
      });
    },

    clearRoutes() {
      set((state) => {
        state.routes = [];
        state.currentRoute = null;
      });
    },

    closePanes() {
      set((state) => {
        state.editor.pane = null;
      });
    },
  };
};

export const useStore = createStore<MapStore>(
  immer((set) => {
    return makeStore(set);
  })
);
