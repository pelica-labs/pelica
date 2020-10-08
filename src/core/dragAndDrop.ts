import { App } from "~/core/helpers";
import { Coordinates, Point } from "~/lib/geometry";

export type DragAndDrop = {
  draggedGeometryId: number | null;
};

const initialState: DragAndDrop = {
  draggedGeometryId: null,
};

export const dragAndDrop = ({ mutate }: App) => ({
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
    mutate(({ geometries, dragAndDrop: drag, history }) => {
      const draggedGeometry = geometries.items.find((geometry) => geometry.id === drag.draggedGeometryId) as Point;

      history.actions.push({
        name: "movePin",
        pinId: draggedGeometry.id,
        coordinates,
      });

      drag.draggedGeometryId = null;
    });
  },
});
