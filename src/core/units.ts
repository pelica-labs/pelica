import { App } from "~/core/helpers";

export type Units = {
  distance: "metric" | "imperial";
};

const initialState: Units = {
  // @todo: initialise this depending on geolocation?
  distance: "metric",
};

export const units = ({ mutate }: App) => ({
  ...initialState,

  toggleDistanceUnit: () => {
    mutate(({ units }) => {
      units.distance = units.distance === "metric" ? "imperial" : "metric";
    });
  },
});
