import { Coordinates } from "~/core/geometries";
import { App } from "~/core/helpers";

export type Geolocation = {
  currentLocation: Coordinates | null;
};

const initialState: Geolocation = {
  currentLocation: null,
};

export const geolocation = ({ mutate }: App) => ({
  ...initialState,

  updateCurrentLocation: (coordinates: Coordinates) => {
    mutate(({ geolocation }) => {
      geolocation.currentLocation = coordinates;
    });
  },
});
