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

  selectGeometry: (geometryId: number) => {
    get().selection.unselectGeometry();

    mutate((state) => {
      state.selection.selectedGeometryId = geometryId;
    });

    const selectedGeometry = get().geometries.items.find((item) => item.id === get().selection.selectedGeometryId);

    if (selectedGeometry?.type === "Line" && selectedGeometry.itinerary) {
      get().itineraries.open();
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
