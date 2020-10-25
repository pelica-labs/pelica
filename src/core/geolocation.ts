import { Position } from "@turf/turf";

import { App } from "~/core/helpers";

export type Geolocation = {
  currentLocation: Position | null;
};

export const geolocationInitialState: Geolocation = {
  currentLocation: null,
};

export const geolocation = ({ mutate }: App) => ({
  ...geolocationInitialState,

  updateCurrentLocation: (coordinates: Position) => {
    mutate(({ geolocation }) => {
      geolocation.currentLocation = coordinates;
    });
  },
});
