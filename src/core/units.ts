import { App } from "~/core/helpers";
import { isServer } from "~/lib/ssr";

export type Units = {
  distance: "metric" | "imperial";
};

export const unitsInitialState: Units = {
  // @todo: not completely accurate
  distance: isServer ? "metric" : window.navigator.language === "en-US" ? "imperial" : "metric",
};

export const units = ({ mutate }: App) => ({
  ...unitsInitialState,

  toggleDistanceUnit: () => {
    mutate(({ units }) => {
      units.distance = units.distance === "metric" ? "imperial" : "metric";
    });
  },
});
