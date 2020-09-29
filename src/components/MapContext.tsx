import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import produce from "immer";
import React, { createContext, useContext, useState } from "react";

type MapState = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  place?: GeocodeFeature | null;
  style?: Style | null;
  editor: {
    isMoving: boolean;
    isDrawing: boolean;
    isShowingStyles: boolean;
  };
};

type MapContext = ReturnType<typeof makeContext>;

const MapContext = createContext<MapContext>(null);

function makeContext(state: MapState, setState: React.Dispatch<React.SetStateAction<MapState>>) {
  return {
    state,

    move(latitude: number, longitude: number, zoom: number) {
      setState(
        produce((state: MapState) => {
          state.coordinates.latitude = latitude;
          state.coordinates.longitude = longitude;
          state.zoom = zoom;
        })
      );
    },

    setZoom(zoom: number) {
      setState(
        produce((state: MapState) => {
          state.zoom = zoom;
        })
      );
    },

    setPlace(place?: GeocodeFeature) {
      setState(
        produce((state: MapState) => {
          state.place = place;
        })
      );
    },

    setStyle(style: Style) {
      setState(
        produce((state: MapState) => {
          state.style = style;
        })
      );
    },

    toggleStyles() {
      setState(
        produce((state: MapState) => {
          state.editor.isShowingStyles = !state.editor.isShowingStyles;
        })
      );
    },

    toggleDrawing() {
      setState(
        produce((state: MapState) => {
          state.editor.isDrawing = !state.editor.isDrawing;
        })
      );
    },
  };
}

export const MapContextProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<MapState>({
    coordinates: {
      latitude: 40,
      longitude: -74.5,
    },
    zoom: 9,
    editor: {
      isMoving: true,
      isDrawing: false,
      isShowingStyles: false,
    },
  });

  const context = makeContext(state, setState);

  return <MapContext.Provider value={context}>{children}</MapContext.Provider>;
};

export const useMap = (): MapContext => {
  return useContext(MapContext);
};
