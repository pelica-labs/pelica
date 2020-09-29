import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { produce } from "immer";
import React, { createContext, useContext, useState } from "react";

export type MarkerState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

type EditorMode = "moving" | "drawing" | "painting";

type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  place?: GeocodeFeature | null;
  style?: Style | null;
  editor: {
    mode: EditorMode;
    isShowingStyles: boolean;
    isPainting: boolean;
  };
  markers: MarkerState[];
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

    toggleStyles() {
      update((state: MapState) => {
        state.editor.isShowingStyles = !state.editor.isShowingStyles;
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

    addMarker(latitude: number, longitude: number) {
      update((state: MapState) => {
        state.markers.push({
          coordinates: {
            latitude,
            longitude,
          },
        });
      });
    },

    clearMarkers() {
      update((state: MapState) => {
        state.markers = [];
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
      mode: "moving",
      isPainting: false,
      isShowingStyles: false,
    },
    markers: [],
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
