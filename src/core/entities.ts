import { bbox, Feature, featureCollection, Geometry } from "@turf/turf";

import { App } from "~/core/helpers";
import { Pin } from "~/core/pins";
import { Route } from "~/core/routes";
import { Text } from "~/core/texts";
import { outlineColor } from "~/lib/color";
import { RawFeature } from "~/map/features";
import { MapSource } from "~/map/sources";

export type Entities = {
  items: Entity[];
};

export type Entity = Route | Pin | Text;

export const entitiesInitialState: Entities = {
  items: [],
};

export const entities = ({ mutate, get }: App) => ({
  ...entitiesInitialState,

  insertFeatures: (features: Feature<Geometry>[]) => {
    const acceptedFeatures = features.filter((feature) => {
      return feature.geometry?.type && ["Point", "LineString"].includes(feature.geometry.type);
    });

    const entities = acceptedFeatures
      .map((feature) => {
        if (feature.geometry?.type === "Point") {
          return {
            id: nextEntityId(),
            type: "Pin",
            source: MapSource.Pins,
            coordinates: feature.geometry.coordinates,
            style: get().pins.style,
          } as Pin;
        }

        if (feature.geometry?.type === "LineString") {
          return {
            id: nextEntityId(),
            type: "Route",
            source: MapSource.Routes,
            transientPoints: [],
            rawPoints: feature.geometry.coordinates,
            points: feature.geometry.coordinates,
            style: get().routes.style,
            smartMatching: {
              enabled: false,
              profile: null,
            },
          } as Route;
        }

        return null;
      })
      .filter((entity): entity is Route | Pin => {
        return !!entity;
      });

    get().history.push({
      name: "insertEntities",
      entities,
    });

    mutate((state) => {
      state.map.bounds = bbox(featureCollection(acceptedFeatures));
    });

    return acceptedFeatures.length;
  },

  // @see imageMissing
  forceRerender: () => {
    mutate((state) => {
      state.entities.items.push({
        type: "Pin",
        id: -1,
        source: MapSource.Pins,
        coordinates: [0, 0],
        style: { color: "black", width: 1, pinType: "pelipin", icon: "star" },
      });
    });

    mutate((state) => {
      state.entities.items.splice(state.entities.items.length - 1, 1);
    });
  },
});

let nextId = 0;

export const nextEntityId = (): number => {
  nextId += 1;

  return nextId;
};

export const entityToFeature = (entity: Entity): RawFeature | null => {
  if (entity.type === "Pin") {
    const style = {
      ...entity.style,
      ...entity.transientStyle,
    };

    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry: {
        type: "Point",
        coordinates: entity.coordinates,
      },
      properties: {
        ...style,
        image: JSON.stringify({
          pin: style.pinType,
          icon: style.icon,
          color: style.color,
        }),
      },
    };
  }

  if (entity.type === "Route") {
    const points = [...entity.points, ...entity.transientPoints];

    if (points.length === 0) {
      return null;
    }

    const style = {
      ...entity.style,
      ...entity.transientStyle,
    };

    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry: {
        type: "LineString",
        coordinates: points,
      },
      properties: {
        ...style,
        outlineColor: outlineColor(style.color, style.outline),
        outlineWidth: style.outline === "none" ? -1 : style.outline === "glow" ? 7 : 1,
        outlineBlur: style.outline === "glow" ? 5 : 0,
      },
    };
  }

  if (entity.type === "Text") {
    const style = {
      ...entity.style,
      ...entity.transientStyle,
    };

    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry: {
        type: "Point",
        coordinates: entity.coordinates,
      },
      properties: {
        ...style,
        outlineColor: outlineColor(style.color, style.outline),
        outlineWidth: style.outline === "none" ? 0 : 0.5,
        outlineBlur: style.outline === "glow" ? 1 : 0,
      },
    };
  }

  return entity;
};
