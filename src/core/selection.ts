import { App } from "~/core/helpers";
import { Point } from "~/lib/geometry";

export type Selection = {
  selectedGeometryId: number | null;
};

const initialState: Selection = {
  selectedGeometryId: null,
};

export const selection = ({ mutate }: App) => ({
  ...initialState,

  selectGeometry: (feature: GeoJSON.Feature<GeoJSON.Geometry>) => {
    mutate(({ selection }) => {
      selection.selectedGeometryId = feature.id as number;
    });
  },

  unselectGeometry: () => {
    mutate(({ selection }) => {
      selection.selectedGeometryId = null;
    });
  },

  deleteSelectedGeometry: () => {
    mutate(({ geometries, selection, history }) => {
      const selectedGeometry = geometries.items.find(
        (geometry) => geometry.id === selection.selectedGeometryId
      ) as Point;

      history.actions.push({
        name: "deleteGeometry",
        geometryId: selectedGeometry.id,
      });
    });
  },
});
