import { booleanContains, booleanCrosses, Polygon } from "@turf/turf";
import { uniq } from "lodash";

import { BoundingBox, Coordinates, geometryToFeature } from "~/core/geometries";
import { App } from "~/core/helpers";
import { getSelectedGeometries } from "~/core/selectors";

export type Selection = {
  area: BoundingBox | null;

  ids: number[];
};

const initialState: Selection = {
  area: null,

  ids: [],
};

export const selection = ({ mutate, get }: App) => ({
  ...initialState,

  startArea: (coordinates: Coordinates) => {
    mutate((state) => {
      state.selection.area = {
        northWest: coordinates,
        southEast: coordinates,
      };
    });
  },

  updateArea: (coordinates: Coordinates) => {
    mutate((state) => {
      if (!state.selection.area) {
        throw new Error("Updating inexistent selection area");
      }

      state.selection.area.southEast = coordinates;

      const geometry: Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [state.selection.area.northWest.longitude, state.selection.area.northWest.latitude],
            [state.selection.area.northWest.longitude, state.selection.area.southEast.latitude],
            [state.selection.area.southEast.longitude, state.selection.area.southEast.latitude],
            [state.selection.area.southEast.longitude, state.selection.area.northWest.latitude],
            [state.selection.area.northWest.longitude, state.selection.area.northWest.latitude],
          ],
        ],
      };

      const selectedFeatureIds = state.geometries.items
        .filter((item) => {
          const feature = geometryToFeature(item) as GeoJSON.Feature<GeoJSON.Geometry>;
          if (!feature) {
            return false;
          }

          const crosses = feature.geometry.type !== "Point" && booleanCrosses(geometry, feature);
          const contains = booleanContains(geometry, feature);

          return crosses || contains;
        })
        .map((feature) => {
          return feature.id as number;
        });

      state.selection.ids = uniq([...state.selection.ids, ...selectedFeatureIds]);
    });
  },

  endArea: () => {
    mutate((state) => {
      state.selection.area = null;
    });
  },

  selectGeometry: (geometryId: number) => {
    get().selection.clear();

    mutate((state) => {
      state.selection.ids = [geometryId];
    });

    const selectedGeometries = getSelectedGeometries(get());
    if (selectedGeometries.length === 1 && selectedGeometries[0].type === "Line" && selectedGeometries[0].itinerary) {
      get().itineraries.open();
    }
  },

  toggleGeometrySelection: (geometryId: number) => {
    mutate((state) => {
      const geometryIndex = state.selection.ids.indexOf(geometryId);
      if (geometryIndex >= 0) {
        state.selection.ids.splice(geometryIndex, 1);
      } else {
        state.selection.ids.push(geometryId);
      }
    });
  },

  clear: () => {
    mutate((state) => {
      state.selection.ids = [];
    });

    get().itineraries.close();
  },

  deleteSelectedGeometries: () => {
    const selectedGeometries = getSelectedGeometries(get());

    get().history.push({
      name: "deleteGeometry",
      geometryIds: selectedGeometries.map((geometry) => {
        return geometry.id;
      }),
    });

    get().itineraries.close();
  },
});
