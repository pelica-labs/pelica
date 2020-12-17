import { BBox, bboxPolygon, booleanWithin } from "@turf/turf";

import { getState, State } from "~/core/app";
import { MapModel } from "~/core/db";
import { CoreEntity, Entity, entityToFeature } from "~/core/entities";
import { Pin } from "~/core/pins";
import { Route } from "~/core/routes";
import { Text } from "~/core/texts";
import { ID } from "~/lib/id";
import { RawFeature } from "~/map/features";

export const getMap = (state: State = getState()): mapboxgl.Map => {
  if (!state.map.current) {
    // Trust the map has been initialized. This simplifies a lot of code behind.
    return (null as unknown) as mapboxgl.Map;
  }

  return state.map.current;
};

export const getBackgroundMap = (state: State = getState()): mapboxgl.Map => {
  if (!state.map.background) {
    // Trust the map has been initialized. This simplifies a lot of code behind.
    return (null as unknown) as mapboxgl.Map;
  }

  return state.map.background;
};

export const getAllEntities = (state: State = getState()): Entity[] => {
  return [...state.entities.items, ...state.entities.transientItems];
};

export const getEntity = (id: ID, state: State = getState()): Entity | undefined => {
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

export const getSelectedItinerary = (state: State = getState()): Route["itinerary"] | null => {
  const entity = getSelectedEntity(state);

  if (entity?.type !== "Route") {
    return null;
  }

  return entity.itinerary ?? null;
};

export const getSelectedRoutes = (state: State = getState()): Route[] => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Route => {
    return entity.type === "Route";
  });
};

export const getSelectedPins = (state: State = getState()): Pin[] => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Pin => {
    return entity.type === "Pin";
  });
};

export const getSelectedTexts = (state: State = getState()): Text[] => {
  return getSelectedEntities(state).filter((entity: Entity): entity is Text => {
    return entity.type === "Text";
  });
};

export const getHoveredEntity = (state: State = getState()): Entity | null | undefined => {
  if (!state.dragAndDrop.hoveredEntityId) {
    return null;
  }

  return getAllEntities(state).find((entity) => {
    return entity.id === state.dragAndDrop.hoveredEntityId;
  });
};

export const getEntityFeatures = (state: State = getState()): RawFeature[] => {
  return state.entities.items
    .map((entity) => {
      return entityToFeature(entity);
    })
    .filter((entity): entity is RawFeature => {
      return !!entity;
    });
};

export const getTransientEntityFeatures = (state: State = getState()): RawFeature[] => {
  return state.entities.transientItems
    .map((entity) => {
      return entityToFeature(entity);
    })
    .filter((entity): entity is RawFeature => {
      return !!entity;
    });
};

export const canSelect = (state: State = getState()): boolean => {
  return ["select", "move", "style", "export", "3d", "scenes"].includes(state.editor.mode);
};

export const getMapTitle = (state: State = getState()): string | undefined => {
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

export const getMapUrl = (state: State = getState()): string => {
  const id = state.sync.id;

  return `${window.location.origin}/map/${id}`;
};

export const getSerializableState = (state: State = getState()): State => {
  return {
    ...state,
    map: {
      ...state.map,
      current: null,
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

    language: state.editor.language,
    style: state.editor.style,
    entities: state.entities.items,

    breakpoints: state.scenes.breakpoints,

    terrain: {
      enabled: state.terrain.enabled,
      exageration: state.terrain.exageration,
      skyColor: state.terrain.skyColor,
      skyboxMode: state.terrain.skyboxMode,
    },
  };
};
