import { AnySourceData } from "mapbox-gl";

import { getMap } from "~/core/selectors";

export enum MapSource {
  Pins = "pins",
  PinPreview = "pinPreview",

  Texts = "texts",
  TextPreview = "textPreview",

  Routes = "routes",
  RouteStop = "routeStop",
  RouteStart = "routeStart",
  RouteNextPoint = "routeNextPoint",
  RouteVertex = "routeVertex",
  RouteEdge = "routeEdge",
  RouteEdgeCenter = "routeEdgeCenter",

  Overlays = "overlays",

  SelectionArea = "selectionArea",

  Watermark = "watermark",
}

const EmptyGeoJsonSource: AnySourceData = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

export const applySources = (): void => {
  const map = getMap();

  addSource(map, MapSource.Routes);
  addSource(map, MapSource.RouteStop);
  addSource(map, MapSource.RouteStart);
  addSource(map, MapSource.RouteNextPoint);
  addSource(map, MapSource.RouteVertex);
  addSource(map, MapSource.RouteEdge);
  addSource(map, MapSource.RouteEdgeCenter);
  addSource(map, MapSource.Pins);
  addSource(map, MapSource.PinPreview);
  addSource(map, MapSource.Texts);
  addSource(map, MapSource.TextPreview);
  addSource(map, MapSource.Overlays);
  addSource(map, MapSource.SelectionArea);
  addSource(map, MapSource.Watermark);
};

const addSource = (map: mapboxgl.Map, id: MapSource) => {
  if (map.getSource(id)) {
    return;
  }

  map.addSource(id, EmptyGeoJsonSource);
};
