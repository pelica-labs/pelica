import { AnySourceData } from "mapbox-gl";

export enum MapSource {
  Pins = "pins",
  Routes = "routes",
  RouteStop = "routeStop",
  Overlays = "overlays",
  SelectionArea = "selectionArea",
}

const EmptyGeoJsonSource: AnySourceData = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

export const applySources = (map: mapboxgl.Map): void => {
  addSource(map, MapSource.Routes);
  addSource(map, MapSource.RouteStop);
  addSource(map, MapSource.Pins);
  addSource(map, MapSource.Overlays);
  addSource(map, MapSource.SelectionArea);
};

const addSource = (map: mapboxgl.Map, id: MapSource) => {
  if (map.getSource(id)) {
    return;
  }

  map.addSource(id, EmptyGeoJsonSource);
};
