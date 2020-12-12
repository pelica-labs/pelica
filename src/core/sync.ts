import { MapModel } from "~/core/db";
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

  mergeState: (map: MapModel) => {
    mutate((state) => {
      state.sync.id = map.id;
      state.sync.userId = map.userId;

      if (map.name) {
        state.sync.name = map.name;
      }

      if (map.coordinates) {
        state.map.coordinates = map.coordinates;
      }

      if (map.zoom) {
        state.map.zoom = map.zoom;
      }

      if (map.bearing) {
        state.map.bearing = map.bearing;
      }

      if (map.pitch) {
        state.map.pitch = map.pitch;
      }

      if (map.language) {
        state.editor.language = map.language;
      }

      if (map.style) {
        state.editor.style = map.style;
      }

      if (map.entities) {
        state.entities.items = map.entities;
      }

      if (map.breakpoints) {
        state.scenes.breakpoints = map.breakpoints;
      }
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
