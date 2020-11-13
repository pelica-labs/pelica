import { bbox, Feature, featureCollection, Geometry, Polygon } from "@turf/turf";

import { App } from "~/core/helpers";
import { Pin } from "~/core/pins";
import { Route, RouteEdge, RouteEdgeCenter, RouteVertex } from "~/core/routes";
import { computeTextSize, Text } from "~/core/texts";
import { outlineColor } from "~/lib/color";
import { numericId } from "~/lib/id";
import { RawFeature } from "~/map/features";
import { PinImageStyle, TextImageStyle } from "~/map/imageMissing";
import { MapSource } from "~/map/sources";

export type Entities = {
  items: CoreEntity[];
  transientItems: TransientEntity[];
};

export type Entity = CoreEntity | TransientEntity;

export type CoreEntity = Route | Pin | Text;

export type TransientEntity = RouteVertex | RouteEdge | RouteEdgeCenter;

export const entitiesInitialState: Entities = {
  items: [],
  transientItems: [],
};

export const entities = ({ mutate, get }: App) => ({
  ...entitiesInitialState,

  updateTransientFeatures: (features: TransientEntity[]) => {
    mutate((state) => {
      state.entities.transientItems = features;
    });
  },

  insertFeatures: (features: Feature<Geometry>[]) => {
    const acceptedFeatures = features.filter((feature) => {
      return feature.geometry?.type && ["Point", "LineString", "Polygon"].includes(feature.geometry.type);
    });

    const entities = acceptedFeatures
      .map((feature) => {
        if (feature.geometry?.type === "Point") {
          return {
            id: numericId(),
            type: "Pin",
            source: MapSource.Pins,
            coordinates: feature.geometry.coordinates,
            style: {
              ...get().pins.style,
              ...feature.properties,
            },
          } as Pin;
        }

        if (feature.geometry?.type === "LineString") {
          return {
            id: numericId(),
            type: "Route",
            source: MapSource.Routes,
            closed: false,
            filled: false,
            transientPoints: [],
            rawPoints: feature.geometry.coordinates,
            points: feature.geometry.coordinates,
            style: {
              ...get().routes.style,
              ...feature.properties,
            },
            smartMatching: {
              enabled: false,
              profile: null,
            },
          } as Route;
        }

        if (feature.geometry?.type === "Polygon") {
          const geometry = feature.geometry as Polygon;
          const points = geometry.coordinates[0].slice(0, geometry.coordinates[0].length - 1);

          return {
            id: numericId(),
            type: "Route",
            source: MapSource.Routes,
            closed: true,
            filled: true,
            transientPoints: [],
            rawPoints: points,
            points: points,
            style: {
              ...get().routes.style,
              ...feature.properties,
            },
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

    get().map.setBounds(bbox(featureCollection(acceptedFeatures)));

    return acceptedFeatures.length;
  },

  // @see imageMissing
  forceRerender: () => {
    mutate((state) => {
      state.entities.items.push({
        type: "Pin",
        id: "RERENDER",
        source: MapSource.Pins,
        coordinates: [0, 0],
        style: {
          color: "black",
          width: 1,
          pinType: "pelipin",
          icon: { collection: "default", name: "star" },
        },
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
          type: "Pin",
          pin: style.pinType,
          icon: style.icon,
          color: style.color,
        } as PinImageStyle),
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

    const geometry = entity.closed
      ? {
          type: "Polygon",
          coordinates: [[...points, points[0]]],
        }
      : {
          type: "LineString",
          coordinates: points,
        };

    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry,
      properties: {
        ...style,
        closed: entity.closed,
        filled: entity.filled,
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
    const [width, height] = computeTextSize(entity);
    const imageStyle: TextImageStyle = {
      type: "Text",
      size: style.width * 2,
      label: style.label,
      color: style.color,
      outlineColor: outlineColor(style.color, style.outline),
      outlineWidth: style.outline === "none" ? 0 : 0.5,
      outlineBlur: style.outline === "glow" ? 1 : 0,
      width,
      height,
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
        image: JSON.stringify(imageStyle),
      },
    };
  }

  if (entity.type === "RouteVertex") {
    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry: {
        type: "Point",
        coordinates: entity.coordinates,
      },
      properties: {
        ...entity.style,
      },
    };
  }

  if (entity.type === "RouteEdge") {
    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry: {
        type: "LineString",
        coordinates: [entity.from, entity.to],
      },
      properties: {
        ...entity.style,
      },
    };
  }

  if (entity.type === "RouteEdgeCenter") {
    return {
      type: "Feature",
      id: entity.id,
      source: entity.source,
      geometry: {
        type: "Point",
        coordinates: entity.coordinates,
      },
      properties: {
        ...entity.style,
      },
    };
  }

  return entity;
};
