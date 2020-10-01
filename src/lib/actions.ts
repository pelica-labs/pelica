import { GeoJSONSource } from "mapbox-gl";

import { joinPoints, Line, Point, PolyLine } from "~/lib/geometry";
import { MapSource } from "~/lib/sources";

export type Action = TraceAction | BrushAction | PinAction | ImportGpxAction;

export type TraceAction = {
  name: "trace";
  line: Line;
};

export type BrushAction = {
  name: "brush";
  line: PolyLine;
};

export type PinAction = {
  name: "pin";
  point: Point;
};

export type ImportGpxAction = {
  name: "importGpx";
  line: PolyLine;
};

const ActionToSource = {
  trace: MapSource.Routes,
  brush: MapSource.Routes,
  pin: MapSource.Pins,
  importGpx: MapSource.Routes,
};

const actionToFeature = (action: Action): GeoJSON.Feature<GeoJSON.Geometry> => {
  if (action.name === "pin") {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [action.point.coordinates.longitude, action.point.coordinates.latitude],
      },
      properties: action.point.style,
    };
  }

  if (action.name === "trace") {
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [action.line.from.longitude, action.line.from.latitude],
          [action.line.to.longitude, action.line.to.latitude],
        ],
      },
      properties: action.line.style,
    };
  }

  if (action.name === "brush") {
    return {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: joinPoints(action.line.points).map((line) => {
          return line.map((point) => {
            return [point.longitude, point.latitude];
          });
        }),
      },
      properties: action.line.style,
    };
  }

  if (action.name === "importGpx") {
    return {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: joinPoints(action.line.points).map((line) => {
          return line.map((point) => {
            return [point.longitude, point.latitude];
          });
        }),
      },
      properties: action.line.style,
    };
  }

  throw new Error("Action is not handled");
};

export const applyActions = (map: mapboxgl.Map, actions: Action[]): void => {
  Object.values(MapSource).forEach((sourceId) => {
    const source = map.getSource(sourceId) as GeoJSONSource;
    if (!source) {
      return;
    }

    const actionsForSource = actions.filter((action) => {
      return ActionToSource[action.name] === sourceId;
    });

    source.setData({
      type: "FeatureCollection",
      features: actionsForSource.map(actionToFeature),
    });
  });
};
