import { merge } from "lodash";
import { State } from "zustand";

import { App } from "~/core/helpers";
import { asyncStorage } from "~/hooks/useAsyncStorage";

export const sync = ({ mutate, get }: App) => ({
  restoreState: async () => {
    const savedState = await asyncStorage.getItem<State>("state");

    mutate((state) => {
      merge(state, savedState);
    });
  },

  saveState: async () => {
    const serialisableState = get();

    const state = JSON.parse(
      JSON.stringify({
        ...serialisableState,
        map: {
          ...serialisableState.map,
          current: undefined,
        },
      })
    );

    if (process.env.NODE_ENV === "development") {
      Object.assign(window, {
        pelica: { state },
      });
    }

    await asyncStorage.setItem("state", state);
  },
});
