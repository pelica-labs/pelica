import { Position } from "@turf/turf";

import { Entity } from "~/core/entities";
import { App } from "~/core/helpers";
import { Route, RouteEdgeCenter } from "~/core/routes";
import { getEntity, getHoveredEntity } from "~/core/selectors";
import { ID } from "~/lib/id";

export type DraggableEntity = Entity & {
  coordinates: Position;
};

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
      const draggedEntity = getEntity(entityId, state) as DraggableEntity;
      if (!draggedEntity) {
        return;
      }

      state.dragAndDrop.draggedEntityId = draggedEntity.id;
      state.dragAndDrop.dragMoved = false;
      state.dragAndDrop.dragOffset = [
        coordinates[0] - draggedEntity.coordinates[0],
        coordinates[1] - draggedEntity.coordinates[1],
      ];

      if (draggedEntity.type === "RouteVertex") {
        const route = getEntity(draggedEntity.routeId, state) as Route;

        route.transientPoints = route.points;
        route.rawPoints = route.points;
        route.points = [];
      }
    });
  },

  dragSelectedEntity: (coordinates: Position) => {
    mutate((state) => {
      if (!state.dragAndDrop.dragOffset || !state.dragAndDrop.draggedEntityId) {
        return;
      }

      const draggedEntity = getEntity(state.dragAndDrop.draggedEntityId, state) as DraggableEntity;

      state.dragAndDrop.dragMoved = true;

      draggedEntity.coordinates = [
        coordinates[0] - state.dragAndDrop.dragOffset[0],
        coordinates[1] - state.dragAndDrop.dragOffset[1],
      ];

      if (draggedEntity.type === "RouteVertex") {
        const route = getEntity(draggedEntity.routeId, state) as Route;

        route.transientPoints[draggedEntity.pointIndex] = [
          coordinates[0] - state.dragAndDrop.dragOffset[0],
          coordinates[1] - state.dragAndDrop.dragOffset[1],
        ];
      }
    });
  },

  endDragSelectedEntity: (coordinates: Position) => {
    const draggedEntityId = get().dragAndDrop.draggedEntityId;
    if (!draggedEntityId) {
      return;
    }

    const draggedEntity = getEntity(draggedEntityId, get()) as DraggableEntity;

    const dragOffset = get().dragAndDrop.dragOffset;
    if (!dragOffset) {
      return;
    }

    if (draggedEntity.type === "RouteVertex") {
      mutate((state) => {
        const route = getEntity(draggedEntity.routeId, state) as Route;

        route.points = route.rawPoints;
        route.transientPoints = [];
      });
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

      if (draggedEntity.type === "RouteVertex") {
        get().history.push({
          name: "moveRouteVertex",
          routeId: draggedEntity.routeId,
          pointIndex: draggedEntity.pointIndex,
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
