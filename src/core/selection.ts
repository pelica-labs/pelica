import { BBox, bboxPolygon, booleanContains, booleanCrosses, Position } from "@turf/turf";
import { uniq } from "lodash";

import { entityToFeature } from "~/core/entities";
import { App } from "~/core/helpers";
import { getSelectedEntities } from "~/core/selectors";
import { RawFeature } from "~/map/features";

export type Selection = {
  area: BBox | null;

  ids: number[];
  preservedIds: number[];
};

export const selectionInitialState: Selection = {
  area: null,

  ids: [],
  preservedIds: [],
};

export const selection = ({ mutate, get }: App) => ({
  ...selectionInitialState,

  preserveSelection: () => {
    mutate((state) => {
      state.selection.preservedIds = state.selection.ids;
    });
  },

  startArea: (coordinates: Position) => {
    mutate((state) => {
      state.selection.area = [coordinates[0], coordinates[1], coordinates[0], coordinates[1]];
    });
  },

  updateArea: (coordinates: Position) => {
    mutate((state) => {
      if (!state.selection.area) {
        throw new Error("Updating inexistent selection area");
      }

      // Update south-east corner
      state.selection.area[2] = coordinates[0];
      state.selection.area[3] = coordinates[1];

      const polygon = bboxPolygon(state.selection.area);

      const selectedFeatureIds = state.entities.items
        .map((item) => {
          return entityToFeature(item);
        })
        .filter((feature): feature is RawFeature => {
          return !!feature;
        })
        .filter((feature) => {
          const crosses = feature.geometry?.type !== "Point" && booleanCrosses(polygon, feature);
          const contains = booleanContains(polygon, feature);

          return crosses || contains;
        })
        .map((feature) => {
          return feature.id;
        });

      // @todo: maybe preserve selection order
      state.selection.ids = uniq([...state.selection.preservedIds, ...selectedFeatureIds]);
    });
  },

  endArea: () => {
    mutate((state) => {
      state.selection.area = null;
      state.selection.preservedIds = [];
    });
  },

  selectEntity: (entityId: number) => {
    get().selection.clear();

    mutate((state) => {
      state.selection.ids = [entityId];
    });

    const selectedEntities = getSelectedEntities(get());
    if (selectedEntities.length === 1 && selectedEntities[0].type === "Route" && selectedEntities[0].itinerary) {
      get().itineraries.open();
    }
  },

  toggleEntitySelection: (entityId: number) => {
    mutate((state) => {
      const entityIndex = state.selection.ids.indexOf(entityId);
      if (entityIndex >= 0) {
        state.selection.ids.splice(entityIndex, 1);
      } else {
        state.selection.ids.push(entityId);
      }
    });
  },

  selectAll: () => {
    mutate((state) => {
      state.selection.ids = state.entities.items.map((entity) => entity.id);
    });
  },

  clear: () => {
    mutate((state) => {
      state.selection.ids = [];
      state.selection.preservedIds = [];
    });

    get().itineraries.close();
  },

  deleteSelectedEntities: () => {
    const selectedEntities = getSelectedEntities(get());

    get().history.push({
      name: "deleteEntity",
      entityIds: selectedEntities.map((entity) => {
        return entity.id;
      }),
    });

    get().itineraries.close();
  },
});
