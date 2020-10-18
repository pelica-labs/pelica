import { Position } from "@turf/turf";

import { App } from "~/core/helpers";
import { Pin } from "~/core/pins";

export type DragAndDrop = {
  draggedEntityId: number | null;
  dragMoved: boolean;
  // @todo: this probably should be stored as a mercator projection
  dragOffset: Position | null;

  hoveredEntityId: number | null;
  hoveredEntitySource: string | null;
};

const initialState: DragAndDrop = {
  draggedEntityId: null,
  dragMoved: false,
  dragOffset: null,

  hoveredEntityId: null,
  hoveredEntitySource: null,
};

export const dragAndDrop = ({ mutate, get }: App) => ({
  ...initialState,

  startHover: (id: number, source: string) => {
    mutate(({ dragAndDrop: drag }) => {
      drag.hoveredEntityId = id;
      drag.hoveredEntitySource = source;
    });
  },

  endHover: () => {
    mutate(({ dragAndDrop: drag }) => {
      drag.hoveredEntityId = null;
      drag.hoveredEntitySource = null;
    });
  },

  startDrag: (entityId: number, coordinates: Position) => {
    mutate((state) => {
      const draggedEntity = state.entities.items.find((entity) => entity.id === entityId) as Pin;

      state.dragAndDrop.draggedEntityId = draggedEntity.id;
      state.dragAndDrop.dragMoved = false;
      state.dragAndDrop.dragOffset = [
        coordinates[0] - draggedEntity.coordinates[0],
        coordinates[1] - draggedEntity.coordinates[1],
      ];
    });
  },

  dragSelectedPin: (coordinates: Position) => {
    mutate((state) => {
      if (!state.dragAndDrop.dragOffset) {
        return;
      }

      const draggedEntity = state.entities.items.find(
        (entity) => entity.id === state.dragAndDrop.draggedEntityId
      ) as Pin;

      state.dragAndDrop.dragMoved = true;

      draggedEntity.coordinates = [
        coordinates[0] - state.dragAndDrop.dragOffset[0],
        coordinates[1] - state.dragAndDrop.dragOffset[1],
      ];
    });
  },

  endDragSelectedPin: (coordinates: Position) => {
    const draggedEntity = get().entities.items.find((entity) => entity.id === get().dragAndDrop.draggedEntityId) as Pin;

    const dragOffset = get().dragAndDrop.dragOffset;
    if (!dragOffset) {
      return;
    }

    if (get().dragAndDrop.dragMoved) {
      get().history.push({
        name: "movePin",
        pinId: draggedEntity.id,
        coordinates: [coordinates[0] - dragOffset[0], coordinates[1] - dragOffset[1]],
      });
    }

    mutate(({ dragAndDrop }) => {
      dragAndDrop.draggedEntityId = null;
      dragAndDrop.dragMoved = false;
      dragAndDrop.dragOffset = null;
    });
  },
});
