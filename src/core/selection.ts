import { App } from "~/core/helpers";
import { Point } from "~/lib/geometry";

export type Selection = {
  selectedGeometryId: number | null;
};

const initialState: Selection = {
  selectedGeometryId: null,
};

export const selection = ({ mutate, get }: App) => ({
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
    const { geometries, selection, history } = get();
    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    history.addAction({
      name: "deleteGeometry",
      geometryId: selectedGeometry.id,
    });
  },
});
