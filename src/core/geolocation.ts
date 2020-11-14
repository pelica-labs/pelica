import { Position } from "@turf/turf";

import { App } from "~/core/zustand";

export type Geolocation = {
  currentLocation: Position | null;
};

export const geolocationInitialState: Geolocation = {
  currentLocation: null,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const geolocation = ({ mutate }: App) => ({
  ...geolocationInitialState,

  updateCurrentLocation: (coordinates: Position) => {
    mutate(({ geolocation }) => {
      geolocation.currentLocation = coordinates;
    });
  },
});
