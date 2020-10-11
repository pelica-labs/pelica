import { Coordinates, Point } from "~/core/geometries";
import { App } from "~/core/helpers";

export type DragAndDrop = {
  draggedGeometryId: number | null;
  dragMoved: boolean;
  hoveredGeometryId: number | null;
  hoveredGeometrySource: string | null;
};

const initialState: DragAndDrop = {
  draggedGeometryId: null,
  dragMoved: false,
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

  startDrag: (geometryId: number) => {
    mutate(({ dragAndDrop: drag }) => {
      drag.draggedGeometryId = geometryId;
      drag.dragMoved = false;
    });
  },

  dragSelectedPin: (coordinates: Coordinates) => {
    mutate(({ geometries, dragAndDrop: drag }) => {
      const draggedGeometry = geometries.items.find((geometry) => geometry.id === drag.draggedGeometryId) as Point;

      drag.dragMoved = true;
      draggedGeometry.coordinates = coordinates;
    });
  },

  endDragSelectedPin: (coordinates: Coordinates) => {
    const { geometries, dragAndDrop, history } = get();
    const draggedGeometry = geometries.items.find((geometry) => geometry.id === dragAndDrop.draggedGeometryId) as Point;

    if (dragAndDrop.dragMoved) {
      history.push({
        name: "movePin",
        pinId: draggedGeometry.id,
        coordinates,
      });
    }

    mutate(({ dragAndDrop }) => {
      dragAndDrop.draggedGeometryId = null;
    });
  },
});
