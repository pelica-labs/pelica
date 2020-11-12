import { AnySourceData, GeoJSONSource, GeoJSONSourceRaw } from "mapbox-gl";

import { getState } from "~/core/app";
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
  const state = getState();

  console.log(state.pins.clusterPoints);

  addSource(map, MapSource.Routes);
  addSource(map, MapSource.RouteStop);
  addSource(map, MapSource.RouteStart);
  addSource(map, MapSource.RouteNextPoint);
  addSource(map, MapSource.RouteVertex);
  addSource(map, MapSource.RouteEdge);
  addSource(map, MapSource.RouteEdgeCenter);
  addSource(map, MapSource.Pins, {
    cluster: state.pins.clusterPoints,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });
  addSource(map, MapSource.PinPreview);
  addSource(map, MapSource.Texts);
  addSource(map, MapSource.TextPreview);
  addSource(map, MapSource.Overlays);
  addSource(map, MapSource.SelectionArea);
  addSource(map, MapSource.Watermark);
};

const addSource = (map: mapboxgl.Map, id: MapSource, options?: Partial<GeoJSONSourceRaw>) => {
  if (map.getSource(id)) {
    map.removeSource(id);
  }

  map.addSource(id, {
    ...EmptyGeoJsonSource,
    ...options,
  });
};

export const setSourceCluster = (source: GeoJSONSource, cluster: boolean): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  source.workerOptions.cluster = cluster;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  source._options.cluster = cluster;
};
