import { BBox, bboxPolygon, booleanWithin } from "@turf/turf";

import { getState, State } from "~/core/app";
import { CoreEntity, Entity, entityToFeature } from "~/core/entities";
import { Pin } from "~/core/pins";
import { Route } from "~/core/routes";
import { Text } from "~/core/texts";
import { MapModel } from "~/lib/db";
import { ID } from "~/lib/id";
import { defaultStyles } from "~/lib/style";
import { RawFeature } from "~/map/features";

export const getMap = (state: State = getState()): mapboxgl.Map => {
  if (!state.map.current) {
    // Trust the map has been initialized. This simplifies a lot of code behind.
    return (null as unknown) as mapboxgl.Map;
  }

  return state.map.current;
};

export const getAllEntities = (state: State = getState()) => {
  return [...state.entities.items, ...state.entities.transientItems];
};

export const getEntity = (id: ID, state: State = getState()) => {
  return getAllEntities(state).find((entity) => {
    return entity.id === id;
  });
};

export const getSelectedEntities = (state: State = getState()): CoreEntity[] => {
  return state.entities.items.filter((entity) => {
    return state.selection.ids.includes(entity.id);
  });
};

export const getSelectedEntity = (state: State = getState()): CoreEntity | null => {
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

export const getSelectedTexts = (state: State = getState()) => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Text => {
    return entity.type === "Text";
  });
};

export const getHoveredEntity = (state: State = getState()) => {
  if (!state.dragAndDrop.hoveredEntityId) {
    return null;
  }

  return getAllEntities(state).find((entity) => {
    return entity.id === state.dragAndDrop.hoveredEntityId;
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

export const getTransientEntityFeatures = (state: State = getState()) => {
  return state.entities.transientItems
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
  if (state.sync.name) {
    return state.sync.name;
  }

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

export const getSerializableState = (state: State = getState()) => {
  return {
    ...state,
    map: {
      ...state.map,
      current: undefined,
    },
  };
};

export const getSyncableState = (state: State = getState()): MapModel => {
  return {
    id: state.sync.id as string,
    userId: state.sync.userId as string,
    createdAt: state.sync.createdAt as number,
    updatedAt: state.sync.updatedAt as number,

    name: state.sync.name || getMapTitle(state),

    coordinates: state.map.coordinates,
    zoom: state.map.zoom,
    bearing: state.map.bearing,
    pitch: state.map.pitch,

    style: state.editor.style,
    entities: state.entities.items,
  };
};
