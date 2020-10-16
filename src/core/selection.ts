import { Point } from "~/core/geometries";
import { App } from "~/core/helpers";

export type Selection = {
  selectedGeometryId: number | null;
};

const initialState: Selection = {
  selectedGeometryId: null,
};

export const selection = ({ mutate, get }: App) => ({
  ...initialState,

  selectGeometry: (feature: GeoJSON.Feature<GeoJSON.Geometry>) => {
    get().selection.unselectGeometry();

    mutate((state) => {
      state.selection.selectedGeometryId = feature.id as number;
    });

    const selectedGeometry = get().geometries.items.find((item) => item.id === get().selection.selectedGeometryId);

    if (selectedGeometry?.type === "Line" && selectedGeometry.steps) {
      get().itineraries.open(selectedGeometry.id);
    }
  },

  unselectGeometry: () => {
    mutate((state) => {
      state.selection.selectedGeometryId = null;
    });

    get().itineraries.close();
  },

  deleteSelectedGeometry: () => {
    const { geometries, selection, history } = get();
    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    history.push({
      name: "deleteGeometry",
      geometryId: selectedGeometry.id,
    });

    get().itineraries.close();
  },
});
