import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { produce } from "immer";
import React, { createContext, useContext, useState } from "react";

export type MarkerState = {
  color: string;
  strokeWidth: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type RouteState = {
  markers: MarkerState[];
};

type EditorMode = "moving" | "drawing" | "painting";

type EditorPane = "styles" | "colors" | "strokeWidth";

type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  place?: GeocodeFeature | null;
  style?: Style | null;
  editor: {
    color: string;
    strokeWidth: number;
    mode: EditorMode;
    pane: EditorPane | null;
    isPainting: boolean;
  };
  routes: RouteState[];
};

type MapContext = ReturnType<typeof makeContext>;

const MapContext = createContext<MapContext | null>(null);

const makeContext = (state: MapState, setState: React.Dispatch<React.SetStateAction<MapState>>) => {
  const update = (fn: (state: MapState) => void) => setState(produce(fn));

  return {
    state,

    move(latitude: number, longitude: number, zoom: number) {
      update((state: MapState) => {
        state.coordinates.latitude = latitude;
        state.coordinates.longitude = longitude;
        state.zoom = zoom;
      });
    },

    setZoom(zoom: number) {
      update((state: MapState) => {
        state.zoom = zoom;
      });
    },

    setPlace(place: GeocodeFeature | null) {
      update((state: MapState) => {
        state.place = place;
      });
    },

    setStyle(style: Style) {
      update((state: MapState) => {
        state.style = style;
      });
    },

    setColor(color: string) {
      update((state: MapState) => {
        state.editor.color = color;
      });
    },

    setStrokeWidth(strokeWidth: number) {
      update((state: MapState) => {
        state.editor.strokeWidth = strokeWidth;
      });
    },

    togglePane(pane: EditorPane) {
      update((state: MapState) => {
        state.editor.pane = state.editor.pane !== pane ? pane : null;
      });
    },

    setEditorMode(mode: EditorMode) {
      update((state: MapState) => {
        state.editor.mode = mode;
      });
    },

    togglePainting(painting?: boolean) {
      update((state: MapState) => {
        state.editor.isPainting = painting ?? !state.editor.isPainting;
      });
    },

    addRoute() {
      const route = {
        markers: [],
      };

      update((state: MapState) => {
        state.routes.push(route);
      });

      return route;
    },

    addMarker(latitude: number, longitude: number) {
      update((state: MapState) => {
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
          color: state.editor.color,
          strokeWidth: state.editor.strokeWidth,
        });
      });
    },

    clearRoutes() {
      update((state: MapState) => {
        state.routes = [];
      });
    },

    closePanes() {
      update((state: MapState) => {
        state.editor.pane = null;
      });
    },
  };
};

export const MapContextProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<MapState>({
    coordinates: {
      latitude: 40,
      longitude: -74.5,
    },
    zoom: 9,
    editor: {
      color: "black",
      strokeWidth: 3,
      mode: "moving",
      isPainting: false,
      pane: null,
    },
    routes: [],
  });

  const context = makeContext(state, setState);

  return <MapContext.Provider value={context}>{children}</MapContext.Provider>;
};

export const useMap = (): MapContext => {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("Missing map context");
  }

  return context;
};
