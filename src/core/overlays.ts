import { BBox, bbox, bboxPolygon, lineString, Position, transformScale } from "@turf/turf";

import { Pin } from "~/core/pins";
import { Route, STOP_DRAWING_CIRCLE_ID } from "~/core/routes";
import { RawFeature } from "~/map/features";
import { MapSource } from "~/map/sources";

export const getWatermarkOverlay = (position: Position): RawFeature => {
  return {
    type: "Feature",
    id: -1,
    source: MapSource.Watermark,
    geometry: {
      type: "Point",
      coordinates: position,
    },
    properties: {},
  };
};

export const getNextPointOverlay = (route: Route, nextPoint: Position): RawFeature => {
  const lastPoint = route.points[route.points.length - 1];

  return {
    type: "Feature",
    id: -1,
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
  const lastPoint = route.points[route.points.length - 1];

  return {
    type: "Feature",
    id: STOP_DRAWING_CIRCLE_ID,
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

export const getRouteOverlay = (route: Route): RawFeature => {
  const polygon = bboxPolygon(bbox(transformScale(lineString(route.points), 1.05 + 0.01 * route.style.width)));

  return {
    type: "Feature",
    id: -1,
    source: MapSource.Overlays,

    geometry: polygon.geometry,
    properties: {},
  };
};

export const getPinOverlay = (pin: Pin): RawFeature => {
  return {
    type: "Feature",
    id: -1,
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

export const getSelectionAreaOverlay = (bbox: BBox): RawFeature => {
  const polygon = bboxPolygon(bbox);

  return {
    type: "Feature",
    id: -1,
    source: MapSource.SelectionArea,
    geometry: polygon.geometry,
    properties: {},
  };
};
