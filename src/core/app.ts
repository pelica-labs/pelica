import { useEffect } from "react";
import create, { StateSelector } from "zustand";
import shallow from "zustand/shallow";

import { dragAndDrop } from "~/core/dragAndDrop";
import { editor } from "~/core/editor";
import { exports } from "~/core/export";
import { geometries } from "~/core/geometries";
import { App, immer } from "~/core/helpers";
import { history } from "~/core/history";
import { imports } from "~/core/import";
import { keyboard } from "~/core/keyboard";
import { line } from "~/core/line";
import { mapView } from "~/core/mapView";
import { pin } from "~/core/pin";
import { screen } from "~/core/screen";
import { selection } from "~/core/selection";
import { sync } from "~/core/sync";

export type State = {
  screen: ReturnType<typeof screen>;
  keyboard: ReturnType<typeof keyboard>;
  mapView: ReturnType<typeof mapView>;
  editor: ReturnType<typeof editor>;
  line: ReturnType<typeof line>;
  pin: ReturnType<typeof pin>;
  history: ReturnType<typeof history>;
  geometries: ReturnType<typeof geometries>;
  selection: ReturnType<typeof selection>;
  dragAndDrop: ReturnType<typeof dragAndDrop>;
  export: ReturnType<typeof exports>;
  import: ReturnType<typeof imports>;
  sync: ReturnType<typeof sync>;
};

const state = (app: App) => {
  return {
    screen: screen(app),
    keyboard: keyboard(app),
    mapView: mapView(app),
    editor: editor(app),
    line: line(app),
    pin: pin(app),
    history: history(app),
    geometries: geometries(app),
    selection: selection(app),
    dragAndDrop: dragAndDrop(app),
    export: exports(),
    import: imports(app),
    sync: sync(app),
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
