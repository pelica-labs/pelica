import { BBox, bbox, bboxPolygon, lineString, Position, transformScale } from "@turf/turf";
import { MercatorCoordinate } from "mapbox-gl";

import { Pin } from "~/core/pins";
import { Route } from "~/core/routes";
import { Text } from "~/core/texts";
import { RawFeature } from "~/map/features";
import { MapSource } from "~/map/sources";

export const getWatermarkOverlay = (position: Position): RawFeature => {
  return {
    type: "Feature",
    id: "WATERMARK",
    source: MapSource.Watermark,
    geometry: {
      type: "Point",
      coordinates: position,
    },
    properties: {},
  };
};

export const getNextPointOverlay = (route: Route, nextPoint: Position): RawFeature => {
  const lastPoint = route.transientPoints.length
    ? route.transientPoints[route.transientPoints.length - 1]
    : route.points[route.points.length - 1];

  if (!lastPoint) {
    return {
      type: "Feature",
      id: "NEXT_POINT",
      source: MapSource.RouteNextPoint,
      geometry: {
        type: "Point",
        coordinates: nextPoint,
      },
      properties: {
        color: route.style.color,
        width: route.style.width,
      },
    };
  }

  return {
    type: "Feature",
    id: "NEXT_POINT",
    source: MapSource.RouteNextPoint,
    geometry: {
      type: "LineString",
      coordinates: [lastPoint, nextPoint],
    },
    properties: {
      color: route.style.color,
      width: route.style.width,
    },
  };
};

export const getRouteStopOverlay = (route: Route): RawFeature => {
  const lastPoint = route.transientPoints.length
    ? route.transientPoints[route.transientPoints.length - 1]
    : route.points[route.points.length - 1];

  return {
    type: "Feature",
    id: 999,
    source: MapSource.RouteStop,
    geometry: {
      type: "Point",
      coordinates: lastPoint,
    },
    properties: {
      color: route.style.color,
      width: route.style.width,
    },
  };
};

export const getRouteStartOverlay = (route: Route): RawFeature => {
  return {
    type: "Feature",
    id: 9999,
    source: MapSource.RouteStart,
    geometry: {
      type: "Point",
      coordinates: route.points[0],
    },
    properties: {
      color: route.style.color,
      width: route.style.width,
    },
  };
};

export const getRouteOverlay = (route: Route): RawFeature => {
  const polygon = bboxPolygon(bbox(transformScale(lineString(route.points), 1.05 + 0.01 * route.style.width)));

  return {
    type: "Feature",
    id: "ROUTE_OVERLAY",
    source: MapSource.Overlays,

    geometry: polygon.geometry,
    properties: {},
  };
};

export const getPinOverlay = (pin: Pin): RawFeature => {
  return {
    type: "Feature",
    id: "PIN_OVERLAY",
    source: MapSource.Overlays,
    geometry: {
      type: "Point",
      coordinates: pin.coordinates,
    },
    properties: {
      target: "Pin",
    },
  };
};

export const getTextOverlay = (text: Text, zoom: number): RawFeature => {
  const left = MercatorCoordinate.fromLngLat(text.coordinates as [number, number], 0);
  const right = MercatorCoordinate.fromLngLat(text.coordinates as [number, number], 0);

  const base = 2 ** (-zoom - 1);

  left.x -= base / 10;
  right.x += base / 10;

  return {
    type: "Feature",
    id: "TEXT_OVERLAY",
    source: MapSource.Overlays,
    geometry: {
      type: "LineString",
      coordinates: [left.toLngLat().toArray(), right.toLngLat().toArray()],
    },
    properties: {
      target: "Text",
    },
  };
};

export const getSelectionAreaOverlay = (bbox: BBox): RawFeature => {
  const polygon = bboxPolygon(bbox);

  return {
    type: "Feature",
    id: "SELECTION_AREA_OVERLAY",
    source: MapSource.SelectionArea,
    geometry: polygon.geometry,
    properties: {},
  };
};
