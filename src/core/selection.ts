import { BBox, bboxPolygon, booleanContains, booleanCrosses, booleanOverlap, Position } from "@turf/turf";
import { uniq } from "lodash";

import { entityToFeature } from "~/core/entities";
import { App } from "~/core/helpers";
import { PinStyle } from "~/core/pins";
import { RouteStyle } from "~/core/routes";
import { getSelectedEntities } from "~/core/selectors";
import { TextStyle } from "~/core/texts";
import { ID } from "~/lib/id";
import { RawFeature } from "~/map/features";

export type Selection = {
  area: BBox | null;

  ids: ID[];
  preservedIds: ID[];
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
          const crosses =
            feature.geometry?.type !== "Point" &&
            feature.geometry?.type !== "Polygon" &&
            booleanCrosses(polygon, feature);
          const overlaps = feature.geometry?.type === "Polygon" && booleanOverlap(polygon, feature);
          const contains = booleanContains(polygon, feature);

          return crosses || overlaps || contains;
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

  selectEntity: (entityId: ID) => {
    get().selection.clear();

    mutate((state) => {
      state.selection.ids = [entityId];
    });

    const selectedEntities = getSelectedEntities(get());
    if (selectedEntities.length === 1 && selectedEntities[0].type === "Route" && selectedEntities[0].itinerary) {
      get().itineraries.open();
    }
  },

  toggleEntitySelection: (entityId: ID) => {
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

  transientUpdateSelection: (style: Partial<RouteStyle> & Partial<PinStyle> & Partial<TextStyle>) => {
    mutate((state) => {
      getSelectedEntities(state).forEach((entity) => {
        if (!entity.transientStyle) {
          entity.transientStyle = entity.style;
        }

        Object.assign(entity.transientStyle, style);
      });
    });
  },

  updateSelection: (style: Partial<RouteStyle> & Partial<PinStyle> & Partial<TextStyle>) => {
    mutate((state) => {
      getSelectedEntities(state).forEach((entity) => {
        delete entity.transientStyle;
      });
    });

    const selectedEntities = getSelectedEntities(get());
    get().history.push({
      name: "updateEntities",
      entityIds: selectedEntities.map((route) => route.id),
      style,
    });
  },
});
