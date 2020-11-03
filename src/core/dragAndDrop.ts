import { Position } from "@turf/turf";

import { App } from "~/core/helpers";
import { Pin } from "~/core/pins";
import { Text } from "~/core/texts";
import { ID } from "~/lib/id";

export type DragAndDrop = {
  draggedEntityId: ID | null;
  dragMoved: boolean;
  // @todo: this probably should be stored as a mercator projection
  dragOffset: Position | null;

  hoveredEntityId: ID | null;
  hoveredEntitySource: string | null;
};

export const dragAndDropInitialState: DragAndDrop = {
  draggedEntityId: null,
  dragMoved: false,
  dragOffset: null,

  hoveredEntityId: null,
  hoveredEntitySource: null,
};

export const dragAndDrop = ({ mutate, get }: App) => ({
  ...dragAndDropInitialState,

  startHover: (id: ID, source: string) => {
    mutate((state) => {
      state.dragAndDrop.hoveredEntityId = id;
      state.dragAndDrop.hoveredEntitySource = source;
    });
  },

  endHover: () => {
    mutate((state) => {
      state.dragAndDrop.hoveredEntityId = null;
      state.dragAndDrop.hoveredEntitySource = null;
    });
  },

  startDrag: (entityId: ID, coordinates: Position) => {
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

  dragSelectedEntity: (coordinates: Position) => {
    mutate((state) => {
      if (!state.dragAndDrop.dragOffset) {
        return;
      }

      const draggedEntity = state.entities.items.find((entity) => entity.id === state.dragAndDrop.draggedEntityId) as
        | Pin
        | Text;

      state.dragAndDrop.dragMoved = true;

      draggedEntity.coordinates = [
        coordinates[0] - state.dragAndDrop.dragOffset[0],
        coordinates[1] - state.dragAndDrop.dragOffset[1],
      ];
    });
  },

  endDragSelectedEntity: (coordinates: Position) => {
    const draggedEntity = get().entities.items.find((entity) => entity.id === get().dragAndDrop.draggedEntityId) as
      | Pin
      | Text;

    const dragOffset = get().dragAndDrop.dragOffset;
    if (!dragOffset) {
      return;
    }

    if (get().dragAndDrop.dragMoved) {
      if (draggedEntity.type === "Pin") {
        get().history.push({
          name: "movePin",
          pinId: draggedEntity.id,
          coordinates: [coordinates[0] - dragOffset[0], coordinates[1] - dragOffset[1]],
        });
      }

      if (draggedEntity.type === "Text") {
        get().history.push({
          name: "moveText",
          textId: draggedEntity.id,
          coordinates: [coordinates[0] - dragOffset[0], coordinates[1] - dragOffset[1]],
        });
      }
    }

    mutate((state) => {
      state.dragAndDrop.draggedEntityId = null;
      state.dragAndDrop.dragMoved = false;
      state.dragAndDrop.dragOffset = null;
    });
  },
});
