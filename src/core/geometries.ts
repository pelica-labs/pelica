import { GeoJSONSource } from "mapbox-gl";

import { App } from "~/core/helpers";
import { SmartMatching } from "~/lib/smartMatching";
import { MapSource } from "~/lib/sources";

export type Geometries = {
  items: Geometry[];
};

const initialState: Geometries = {
  items: [],
};

export const geometries = ({ mutate }: App) => ({
  ...initialState,

  redraw: () => {
    mutate(({ geometries }) => {
      geometries.items.push({
        id: 1,
        source: MapSource.Pins,
        type: "Circle",
        coordinates: { latitude: 0, longitude: 0 },
      });
    });

    mutate(({ geometries }) => {
      geometries.items.splice(geometries.items.length - 1);
    });
  },
});

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Position = {
  x: number;
  y: number;
};

export type BoundingBox = {
  northWest: Coordinates;
  southEast: Coordinates;
};

export type Geometry = PolyLine | Point | Circle | Rectangle | Polygon;

export type PolyLine = {
  id: number;
  source: MapSource;
  type: "Line";
  points: Coordinates[];
  smartPoints: Coordinates[];
  smartMatching: SmartMatching;
  style: {
    color: string;
    width: number;
    outlineColor: string;
  };
  transientStyle?: {
    color: string;
    width: number;
    outlineColor: string;
  };
};

export type Point = {
  id: number;
  source: MapSource;
  type: "Point";
  coordinates: Coordinates;
  style: {
    color: string;
    width: number;
    icon: string;
    target?: "Point";
  };
  transientStyle?: {
    color: string;
    width: number;
  };
};

export type Circle = {
  id: number;
  source: MapSource;
  type: "Circle";
  coordinates: Coordinates;
  style?: {
    color: string;
    width: number;
  };
};

export type Rectangle = {
  id: number;
  source: MapSource;
  type: "Rectangle";
  box: BoundingBox;
};

export type Polygon = {
  id: number;
  source: MapSource;
  type: "Polygon";
  lines: Coordinates[][];
};

let _nextId = 0;

export const nextGeometryId = (): number => {
  _nextId += 1;
  return _nextId;
};

const geometryToFeature = (geometry: Geometry): GeoJSON.Feature<GeoJSON.Geometry> => {
  if (geometry.type === "Point") {
    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "Point",
        coordinates: [geometry.coordinates.longitude, geometry.coordinates.latitude],
      },
      properties: {
        ...geometry.style,
        ...geometry.transientStyle,
      },
    };
  }

  if (geometry.type === "Circle") {
    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "Point",
        coordinates: [geometry.coordinates.longitude, geometry.coordinates.latitude],
      },
      properties: {
        ...geometry.style,
        target: "Point",
      },
    };
  }

  if (geometry.type === "Line") {
    const points =
      geometry.smartMatching.enabled && geometry.smartPoints.length ? geometry.smartPoints : geometry.points;

    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "MultiLineString",
        coordinates: joinPoints(points).map((line) => {
          return line.map((point) => {
            return [point.longitude, point.latitude];
          });
        }),
      },
      properties: {
        ...geometry.style,
        ...geometry.transientStyle,
      },
    };
  }

  if (geometry.type === "Rectangle") {
    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [geometry.box.northWest.longitude, geometry.box.northWest.latitude],
            [geometry.box.northWest.longitude, geometry.box.southEast.latitude],
            [geometry.box.southEast.longitude, geometry.box.southEast.latitude],
            [geometry.box.southEast.longitude, geometry.box.northWest.latitude],
            [geometry.box.northWest.longitude, geometry.box.northWest.latitude],
          ],
        ],
      },
      properties: {},
    };
  }

  if (geometry.type === "Polygon") {
    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "Polygon",
        coordinates: geometry.lines.map((points) => {
          return points.map((point) => {
            return [point.longitude, point.latitude];
          });
        }),
      },
      properties: {},
    };
  }

  throw new Error("Geometry is not handled");
};

export const applyGeometries = (map: mapboxgl.Map, geometries: Geometry[]): void => {
  geometries.forEach((geometry) => {
    const source = map.getSource(geometry.source) as GeoJSONSource;
    if (!source) {
      return;
    }
  });

  Object.values(MapSource).forEach((sourceId) => {
    const source = map.getSource(sourceId) as GeoJSONSource;
    if (!source) {
      return;
    }

    const geometriesForSource = geometries.filter((geometry) => {
      return geometry.source === sourceId;
    });

    source.setData({
      type: "FeatureCollection",
      features: geometriesForSource.map((geometry) => {
        return geometryToFeature(geometry);
      }),
    });
  });
};

export const joinPoints = (points: Coordinates[]): Coordinates[][] => {
  const lines: Coordinates[][] = [];

  for (let i = 1; i < points.length; i++) {
    const previousPoint = points[i - 1];
    const point = points[i];

    lines.push([previousPoint, point]);
  }

  return lines;
};
