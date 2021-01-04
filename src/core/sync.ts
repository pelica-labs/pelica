import { initialState } from "~/core/app";
import { MapModel } from "~/core/db";
import { editorInitialState } from "~/core/editor";
import { mapInitialState } from "~/core/map";
import { terrainInitialState } from "~/core/terrain";
import { App } from "~/core/zustand";
import { ID } from "~/lib/id";

type Sync = {
  id: ID | null;
  userId: ID | null;
  name: string | null;
  syncing: boolean;
  createdAt: number | null;
  updatedAt: number | null;
};

export const syncInitialState: Sync = {
  id: null,
  userId: null,
  name: null,
  syncing: false,
  createdAt: null,
  updatedAt: null,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sync = ({ mutate }: App) => ({
  ...syncInitialState,

  updateName: (name: string | null) => {
    mutate((state) => {
      state.sync.name = name;
    });
  },

  reset: () => {
    mutate((state) => {
      Object.assign(state, initialState);
    });
  },

  mergeState: (map: MapModel) => {
    mutate((state) => {
      state.sync.id = map.id;
      state.sync.userId = map.userId;
      state.sync.name = map.name ?? null;

      state.map.coordinates = map.coordinates ?? mapInitialState.coordinates;
      state.map.zoom = map.zoom ?? mapInitialState.zoom;
      state.map.bearing = map.bearing ?? mapInitialState.bearing;
      state.map.pitch = map.pitch ?? mapInitialState.pitch;

      state.editor.language = map.language ?? editorInitialState.language;
      state.editor.style = map.style ?? editorInitialState.style;

      state.entities.items = map.entities ?? [];

      state.scenes.breakpoints = map.breakpoints ?? [];

      Object.assign(state.terrain, map.terrain ?? terrainInitialState);
    });
  },

  saveState: async (map: MapModel) => {
    mutate((state) => {
      state.sync.syncing = true;
    });

    await fetch("/api/sync-map", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(map),
    });

    mutate((state) => {
      state.sync.syncing = false;
    });
  },
});
