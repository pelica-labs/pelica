import { Coordinates, Point } from "~/core/geometries";
import { App } from "~/core/helpers";

export type DragAndDrop = {
  draggedGeometryId: number | null;
  dragMoved: boolean;
  // @todo: this probably should be stored as a mercator projection
  dragOffset: Coordinates | null;

  hoveredGeometryId: number | null;
  hoveredGeometrySource: string | null;
};

const initialState: DragAndDrop = {
  draggedGeometryId: null,
  dragMoved: false,
  dragOffset: null,

  hoveredGeometryId: null,
  hoveredGeometrySource: null,
};

export const dragAndDrop = ({ mutate, get }: App) => ({
  ...initialState,

  startHover: (id: number, source: string) => {
    mutate(({ dragAndDrop: drag }) => {
      drag.hoveredGeometryId = id;
      drag.hoveredGeometrySource = source;
    });
  },

  endHover: () => {
    mutate(({ dragAndDrop: drag }) => {
      drag.hoveredGeometryId = null;
      drag.hoveredGeometrySource = null;
    });
  },

  startDrag: (geometryId: number, coordinates: Coordinates) => {
    mutate((state) => {
      const draggedGeometry = state.geometries.items.find((geometry) => geometry.id === geometryId) as Point;

      state.dragAndDrop.draggedGeometryId = draggedGeometry.id;
      state.dragAndDrop.dragMoved = false;
      state.dragAndDrop.dragOffset = {
        latitude: coordinates.latitude - draggedGeometry.coordinates.latitude,
        longitude: coordinates.longitude - draggedGeometry.coordinates.longitude,
      };
    });
  },

  dragSelectedPin: (coordinates: Coordinates) => {
    mutate((state) => {
      if (!state.dragAndDrop.dragOffset) {
        return;
      }

      const draggedGeometry = state.geometries.items.find(
        (geometry) => geometry.id === state.dragAndDrop.draggedGeometryId
      ) as Point;

      state.dragAndDrop.dragMoved = true;

      draggedGeometry.coordinates = {
        latitude: coordinates.latitude - state.dragAndDrop.dragOffset.latitude,
        longitude: coordinates.longitude - state.dragAndDrop.dragOffset.longitude,
      };
    });
  },

  endDragSelectedPin: (coordinates: Coordinates) => {
    const draggedGeometry = get().geometries.items.find(
      (geometry) => geometry.id === get().dragAndDrop.draggedGeometryId
    ) as Point;

    const dragOffset = get().dragAndDrop.dragOffset;
    if (!dragOffset) {
      return;
    }

    if (get().dragAndDrop.dragMoved) {
      get().history.push({
        name: "movePin",
        pinId: draggedGeometry.id,
        coordinates: {
          latitude: coordinates.latitude - dragOffset.latitude,
          longitude: coordinates.longitude - dragOffset.longitude,
        },
      });
    }

    mutate(({ dragAndDrop }) => {
      dragAndDrop.draggedGeometryId = null;
      dragAndDrop.dragMoved = false;
      dragAndDrop.dragOffset = null;
    });
  },
});
