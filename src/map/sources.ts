import mapboxgl, { AnySourceData, GeoJSONSource, GeoJSONSourceRaw } from "mapbox-gl";

import { getState } from "~/core/app";

export enum MapSource {
  Pin = "pin",
  PinPreview = "pin-preview",

  Text = "text",
  TextPreview = "text-preview",

  Route = "route",
  RouteStop = "route-stop",
  RouteStart = "route-start",
  RouteNextPoint = "route-next-point",
  RouteVertex = "route-vertex",
  RouteEdge = "route-edge",
  RouteEdgeCenter = "route-edge-center",

  Overlay = "overlay",

  SelectionArea = "selection-area",

  Watermark = "watermark",

  // Mapbox
  MapboxDem = "mapbox-dem",
}

const EmptyGeoJsonSource: AnySourceData = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

export const applySources = (map: mapboxgl.Map): void => {
  const state = getState();

  addSource(map, MapSource.Route);
  addSource(map, MapSource.RouteStop);
  addSource(map, MapSource.RouteStart);
  addSource(map, MapSource.RouteNextPoint);
  addSource(map, MapSource.RouteVertex);
  addSource(map, MapSource.RouteEdge);
  addSource(map, MapSource.RouteEdgeCenter);
  addSource(map, MapSource.Pin, {
    cluster: state.pins.clusterPoints,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });
  addSource(map, MapSource.PinPreview);
  addSource(map, MapSource.Text);
  addSource(map, MapSource.TextPreview);
  addSource(map, MapSource.Overlay);
  addSource(map, MapSource.SelectionArea);
  addSource(map, MapSource.Watermark);
};

export const addSource = (map: mapboxgl.Map, id: MapSource, options?: Partial<GeoJSONSourceRaw>): void => {
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
