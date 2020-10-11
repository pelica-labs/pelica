import { Coordinates, Point } from "~/core/geometries";
import { App } from "~/core/helpers";

export type DragAndDrop = {
  draggedGeometryId: number | null;
};

const initialState: DragAndDrop = {
  draggedGeometryId: null,
};

export const dragAndDrop = ({ mutate, get }: App) => ({
  ...initialState,

  startDrag: (feature: GeoJSON.Feature<GeoJSON.Geometry>) => {
    mutate(({ dragAndDrop: drag }) => {
      drag.draggedGeometryId = feature.id as number;
    });
  },

  dragSelectedPin: (coordinates: Coordinates) => {
    mutate(({ geometries, dragAndDrop: drag }) => {
      const draggedGeometry = geometries.items.find((geometry) => geometry.id === drag.draggedGeometryId) as Point;

      draggedGeometry.coordinates = coordinates;
    });
  },

  endDragSelectedPin: (coordinates: Coordinates) => {
    const { geometries, dragAndDrop, history } = get();
    const draggedGeometry = geometries.items.find((geometry) => geometry.id === dragAndDrop.draggedGeometryId) as Point;

    history.push({
      name: "movePin",
      pinId: draggedGeometry.id,
      coordinates,
    });

    mutate(({ dragAndDrop }) => {
      dragAndDrop.draggedGeometryId = null;
    });
  },
});
