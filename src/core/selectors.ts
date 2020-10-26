import { BBox, bboxPolygon, booleanWithin } from "@turf/turf";

import { getState, State } from "~/core/app";
import { Entity, entityToFeature } from "~/core/entities";
import { Pin } from "~/core/pins";
import { Route } from "~/core/routes";
import { defaultStyles } from "~/lib/style";
import { RawFeature } from "~/map/features";

export const getSelectedEntities = (state: State = getState()) => {
  return state.entities.items.filter((entity) => {
    return state.selection.ids.includes(entity.id);
  });
};

export const getSelectedEntity = (state: State = getState()) => {
  const entities = getSelectedEntities(state);

  if (entities.length !== 1) {
    return null;
  }

  return entities[0];
};

export const getSelectedItinerary = (state: State = getState()) => {
  const entity = getSelectedEntity(state);

  if (entity?.type !== "Route") {
    return null;
  }

  return entity.itinerary ?? null;
};

export const getSelectedRoutes = (state: State = getState()) => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Route => {
    return entity.type === "Route";
  });
};

export const getSelectedPins = (state: State = getState()) => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Pin => {
    return entity.type === "Pin";
  });
};

export const getEntityFeatures = (state: State = getState()) => {
  return state.entities.items
    .map((entity) => {
      return entityToFeature(entity);
    })
    .filter((entity): entity is RawFeature => {
      return !!entity;
    })
    .map((feature) => {
      Object.assign(feature.properties, defaultStyles, state.editor.style.overrides);

      return feature;
    });
};

export const getMapTitle = (state: State = getState()) => {
  const feature = state.map.features
    .filter((feature) => {
      return !feature.place_type.includes("postcode") && !feature.place_type.includes("address");
    })
    .find((feature) => {
      if (!feature.bbox || !state.map.bounds) {
        return false;
      }

      return booleanWithin(bboxPolygon(state.map.bounds), bboxPolygon(feature.bbox as BBox));
    });

  return feature?.place_name;
};
