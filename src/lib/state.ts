import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Tracepoint } from "@mapbox/mapbox-sdk/services/map-matching";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { GetState } from "zustand";

import { mapboxMapMatching } from "~/lib/mapbox";
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

export type EditorMode = "move" | "trace" | "freeDraw";

export type EditorPane = "styles" | "colors" | "strokeWidth";

type MapStore = ReturnType<typeof makeStore> & MapState;

const makeStore = (set: (fn: (draft: MapState) => void) => void, get: GetState<MapState>) => {
  return {
    coordinates: {
      latitude: 40,
      longitude: -74.5,
    },
    zoom: 9,
    editor: {
      strokeColor: "black",
      strokeWidth: 3,
      mode: "move" as EditorMode,
      isPainting: false,
      pane: null,
    },
    currentRoute: null as RouteState | null,
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
        if (state.editor.mode === "trace" && state.currentRoute) {
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

    async endRoute() {
      const currentRoute = get().currentRoute;
      if (!currentRoute || currentRoute.markers.length === 0) {
        return;
      }

      const color = currentRoute.markers[0].strokeColor;
      const width = currentRoute.markers[0].strokeWidth;

      set((state) => {
        state.currentRoute = null;
      });

      if (currentRoute.markers.length < 2) {
        return;
      }

      const res = await mapboxMapMatching
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .getMatch({
          profile: "walking",
          points: currentRoute.markers.map((marker) => {
            return {
              coordinates: [marker.coordinates.longitude, marker.coordinates.latitude],
            };
          }),
        })
        .send();

      if (!res.body.tracepoints) {
        set((state) => {
          state.routes.push(currentRoute);
        });
        return;
      }

      const improvedRoute: MarkerState[] = (res.body.tracepoints as Tracepoint[])
        .filter((tracepoint) => tracepoint !== null)
        .map((tracepoint) => {
          return {
            strokeWidth: width,
            strokeColor: color,
            coordinates: {
              longitude: tracepoint.location[0],
              latitude: tracepoint.location[1],
            },
          };
        });

      set((state) => {
        state.routes.push({
          markers: improvedRoute,
        });
      });
    },

    addMarker(latitude: number, longitude: number) {
      set((state) => {
        if (!state.currentRoute) {
          return;
        }

        state.currentRoute.markers.push({
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
  immer((set, get) => {
    return makeStore(set, get);
  })
);
