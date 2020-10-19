import { State } from "~/core/app";
import { Entity, entityToFeature } from "~/core/entities";
import { Pin } from "~/core/pins";
import { Route } from "~/core/routes";
import { RawFeature } from "~/map/features";

export const getSelectedEntities = (state: State) => {
  return state.entities.items.filter((entity) => {
    return state.selection.ids.includes(entity.id);
  });
};

export const getSelectedEntity = (state: State) => {
  const entities = getSelectedEntities(state);

  if (entities.length !== 1) {
    return null;
  }

  return entities[0];
};

export const getSelectedItinerary = (state: State) => {
  const entity = getSelectedEntity(state);

  if (entity?.type !== "Route") {
    return null;
  }

  return entity.itinerary ?? null;
};

export const getSelectedRoutes = (state: State) => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Route => {
    return entity.type === "Route";
  });
};

export const getSelectedPins = (state: State) => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Pin => {
    return entity.type === "Pin";
  });
};

export const getEntityFeatures = (state: State) => {
  return state.entities.items
    .map((entity) => {
      return entityToFeature(entity);
    })
    .filter((entity): entity is RawFeature => {
      return !!entity;
    });
};