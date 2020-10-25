import { useEffect } from "react";
import create, { StateSelector } from "zustand";
import shallow from "zustand/shallow";

import { alerts } from "~/core/alerts";
import { dragAndDrop } from "~/core/dragAndDrop";
import { editor } from "~/core/editor";
import { entities } from "~/core/entities";
import { exports } from "~/core/export";
import { geolocation } from "~/core/geolocation";
import { App, immer } from "~/core/helpers";
import { history } from "~/core/history";
import { imports } from "~/core/import";
import { itineraries } from "~/core/itineraries";
import { map } from "~/core/map";
import { pins } from "~/core/pins";
import { platform } from "~/core/platform";
import { routes } from "~/core/routes";
import { selection } from "~/core/selection";
import { sync } from "~/core/sync";
import { units } from "~/core/units";

export type State = {
  alerts: ReturnType<typeof alerts>;
  platform: ReturnType<typeof platform>;
  geolocation: ReturnType<typeof geolocation>;
  map: ReturnType<typeof map>;
  editor: ReturnType<typeof editor>;
  routes: ReturnType<typeof routes>;
  itineraries: ReturnType<typeof itineraries>;
  pins: ReturnType<typeof pins>;
  history: ReturnType<typeof history>;
  entities: ReturnType<typeof entities>;
  selection: ReturnType<typeof selection>;
  dragAndDrop: ReturnType<typeof dragAndDrop>;
  exports: ReturnType<typeof exports>;
  imports: ReturnType<typeof imports>;
  sync: ReturnType<typeof sync>;
  units: ReturnType<typeof units>;
};

const state = (app: App) => {
  return {
    alerts: alerts(app),
    platform: platform(app),
    geolocation: geolocation(app),
    map: map(app),
    editor: editor(app),
    routes: routes(app),
    pins: pins(app),
    itineraries: itineraries(app),
    history: history(app),
    entities: entities(app),
    selection: selection(app),
    dragAndDrop: dragAndDrop(app),
    exports: exports(app),
    imports: imports(app),
    sync: sync(app),
    units: units(app),
  };
};

export const useStore = create<ReturnType<typeof state>>(
  immer((mutate, get) => {
    return state({ mutate, get });
  })
);

export const useStoreSubscription = <T extends State, StateSlice>(
  selector: StateSelector<T, StateSlice>,
  listener: (state: StateSlice) => void
): void => {
  return useEffect(() => {
    return subscribe(selector, listener);
  }, []);
};

export const subscribe = <T extends State, StateSlice>(
  selector: StateSelector<T, StateSlice>,
  listener: (state: StateSlice) => void
) => {
  return useStore.subscribe(
    (state) => {
      if (state !== null) {
        listener(state);
      }
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    selector,
    shallow
  );
};

export const getState = (): State => useStore.getState();

export const useApp = (): State => useStore.getState();
