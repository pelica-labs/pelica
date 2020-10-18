import { Position } from "@turf/turf";

import { App } from "~/core/helpers";

export type Geolocation = {
  currentLocation: Position | null;
};

const initialState: Geolocation = {
  currentLocation: null,
};

export const geolocation = ({ mutate }: App) => ({
  ...initialState,

  updateCurrentLocation: (coordinates: Position) => {
    mutate(({ geolocation }) => {
      geolocation.currentLocation = coordinates;
    });
  },
});
