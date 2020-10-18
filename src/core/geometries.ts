import { distance } from "@turf/turf";
import { GeoJSONSource } from "mapbox-gl";

import { App } from "~/core/helpers";
import { ItineraryProfile, Place } from "~/core/itineraries";
import { RouteStyle } from "~/core/routes";
import { outlineColor } from "~/lib/color";
import { SmartMatching } from "~/lib/smartMatching";
import { MapSource } from "~/map/sources";

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

export type Geometry = Line | Point | Circle | Rectangle | Polygon;

export type Line = {
  id: number;
  source: MapSource;
  type: "Line";
  transientPoints: Coordinates[];
  rawPoints: Coordinates[];
  points: Coordinates[];
  smartMatching: SmartMatching;
  style: RouteStyle;
  transientStyle?: RouteStyle;
  itinerary?: {
    steps: Place[];
    profile: ItineraryProfile;
  };
};

export type ItineraryLine = Line & {
  itinerary: {
    steps: Place[];
    profile: ItineraryProfile;
  };
};

export const computeDistance = (line: Line): number => {
  const points = [...line.points, ...line.transientPoints];

  if (points.length < 2) {
    return 0;
  }

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const from = [points[i - 1].longitude, points[i - 1].latitude];
    const to = [points[i].longitude, points[i].latitude];

    total += distance(from, to);
  }

  return total;
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

export const geometryToFeature = (geometry: Geometry): GeoJSON.Feature<GeoJSON.Geometry> | null => {
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
    const points = [...geometry.points, ...geometry.transientPoints];

    if (points.length === 0) {
      return null;
    }

    const style = {
      ...geometry.style,
      ...geometry.transientStyle,
    };

    return {
      type: "Feature",
      id: geometry.id,
      geometry: {
        type: "LineString",
        coordinates: points.map((point) => [point.longitude, point.latitude]),
      },
      properties: {
        ...style,
        outlineColor: outlineColor(style.color, style.outline),
        outlineWidth: style.outline === "none" ? -1 : style.outline === "glow" ? 7 : 1,
        outlineBlur: style.outline === "glow" ? 5 : 0,
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
      features: geometriesForSource
        .map((geometry) => {
          return geometryToFeature(geometry) as GeoJSON.Feature<GeoJSON.Geometry>;
        })
        .filter((feature) => {
          return !!feature;
        }),
    });
  });
};
