import { capitalize, mapValues } from "lodash";
import { useEffect } from "react";
import create, { StateSelector } from "zustand";
import shallow from "zustand/shallow";

import { alerts, alertsInitialState } from "~/core/alerts";
import { dragAndDrop, dragAndDropInitialState } from "~/core/dragAndDrop";
import { editor, editorInitialState } from "~/core/editor";
import { entities, entitiesInitialState } from "~/core/entities";
import { exports, exportsInitialState } from "~/core/export";
import { geolocation, geolocationInitialState } from "~/core/geolocation";
import { App, immer } from "~/core/helpers";
import { history, historyInitialState } from "~/core/history";
import { imports } from "~/core/import";
import { itineraries, itinerariesInitialState } from "~/core/itineraries";
import { map, mapInitialState } from "~/core/map";
import { pins, pinsInitialState } from "~/core/pins";
import { platform, platformInitialState } from "~/core/platform";
import { routes, routesInitialState } from "~/core/routes";
import { selection, selectionInitialState } from "~/core/selection";
import { sync } from "~/core/sync";
import { texts, textsInitialState } from "~/core/texts";
import { units, unitsInitialState } from "~/core/units";
import { logEvent } from "~/lib/analytics";

export type State = {
  alerts: ReturnType<typeof alerts>;
  platform: ReturnType<typeof platform>;
  geolocation: ReturnType<typeof geolocation>;
  map: ReturnType<typeof map>;
  editor: ReturnType<typeof editor>;
  routes: ReturnType<typeof routes>;
  itineraries: ReturnType<typeof itineraries>;
  pins: ReturnType<typeof pins>;
  texts: ReturnType<typeof texts>;
  history: ReturnType<typeof history>;
  entities: ReturnType<typeof entities>;
  selection: ReturnType<typeof selection>;
  dragAndDrop: ReturnType<typeof dragAndDrop>;
  exports: ReturnType<typeof exports>;
  imports: ReturnType<typeof imports>;
  sync: ReturnType<typeof sync>;
  units: ReturnType<typeof units>;
};

export type Actions = {
  alerts: Omit<State["alerts"], keyof typeof alertsInitialState>;
  platform: Omit<State["platform"], keyof typeof platformInitialState>;
  geolocation: Omit<State["geolocation"], keyof typeof geolocationInitialState>;
  map: Omit<State["map"], keyof typeof mapInitialState>;
  editor: Omit<State["editor"], keyof typeof editorInitialState>;
  routes: Omit<State["routes"], keyof typeof routesInitialState>;
  itineraries: Omit<State["itineraries"], keyof typeof itinerariesInitialState>;
  pins: Omit<State["pins"], keyof typeof pinsInitialState>;
  texts: Omit<State["texts"], keyof typeof textsInitialState>;
  history: Omit<State["history"], keyof typeof historyInitialState>;
  entities: Omit<State["entities"], keyof typeof entitiesInitialState>;
  selection: Omit<State["selection"], keyof typeof selectionInitialState>;
  dragAndDrop: Omit<State["dragAndDrop"], keyof typeof dragAndDropInitialState>;
  exports: Omit<State["exports"], keyof typeof exportsInitialState>;
  imports: State["imports"];
  sync: State["sync"];
  units: Omit<State["units"], keyof typeof unitsInitialState>;
};

const unloggedActions = [
  ["sync", "saveState"],
  ["platform", "updateKeyboard"],
];

const state = (app: App) => {
  return {
    alerts: alerts(app),
    platform: platform(app),
    geolocation: geolocation(app),
    map: map(app),
    editor: editor(app),
    routes: routes(app),
    pins: pins(app),
    texts: texts(app),
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

export const app = mapValues(getState() as Readonly<Actions>, (service, name) => {
  return new Proxy(
    {},
    {
      get: (_, action) => {
        const skipLogs = unloggedActions.find((item) => {
          return name === item[0] && action === item[1];
        });

        if (skipLogs) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return service[action];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args: any) => {
          if (process.env.NODE_ENV === "development") {
            console.debug(`${name}.${action as string}`, ...args);
          }

          logEvent(capitalize(name), action as string);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return service[action](...args);
        };
      },
    }
  );
});
