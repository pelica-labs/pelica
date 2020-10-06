import { GeoJSONSource } from "mapbox-gl";

import { MapSource } from "~/lib/sources";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Position = {
  x: number;
  y: number;
};

export type Geometry = PolyLine | Point;

export type PolyLine = {
  id: number;
  source: MapSource;
  type: "PolyLine";
  points: Coordinates[];
  style: {
    strokeColor: string;
    strokeWidth: number;
  };
};

export type Point = {
  id: number;
  source: MapSource;
  type: "Point";
  coordinates: Coordinates;
  selected: boolean;
  style: {
    strokeColor: string;
    strokeWidth: number;
  };
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
        selected: geometry.selected,
      },
    };
  }

  if (geometry.type === "PolyLine") {
    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "MultiLineString",
        coordinates: joinPoints(geometry.points).map((line) => {
          return line.map((point) => {
            return [point.longitude, point.latitude];
          });
        }),
      },
      properties: {
        ...geometry.style,
      },
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
