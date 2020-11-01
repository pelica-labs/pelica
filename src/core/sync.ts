import { App } from "~/core/helpers";
import { MapModel } from "~/lib/db";
import { ID } from "~/lib/id";

type Sync = {
  id: ID | null;
  userId: ID | null;
};

export const syncInitialState: Sync = {
  id: null,
  userId: null,
};

export const sync = ({ mutate }: App) => ({
  ...syncInitialState,

  mergeState: (map: MapModel) => {
    mutate((state) => {
      state.sync.id = map.id;
      state.sync.userId = map.userId;

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

      if (map.style) {
        state.editor.style = map.style;
      }

      if (map.entities) {
        state.entities.items = map.entities;
      }
    });
  },

  saveState: async (map: MapModel) => {
    await fetch("/api/sync-map", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(map),
    });
  },
});
