import { App } from "~/core/helpers";
import { isServer } from "~/lib/ssr";

export type Units = {
  distance: "metric" | "imperial";
};

const initialState: Units = {
  // @todo: not completely accurate
  distance: isServer ? "metric" : window.navigator.language === "en-US" ? "imperial" : "metric",
};

export const units = ({ mutate }: App) => ({
  ...initialState,

  toggleDistanceUnit: () => {
    mutate(({ units }) => {
      units.distance = units.distance === "metric" ? "imperial" : "metric";
    });
  },
});
