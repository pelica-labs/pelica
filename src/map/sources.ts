import { AnySourceData } from "mapbox-gl";

export enum MapSource {
  Pins = "pins",
  Texts = "texts",
  Routes = "routes",
  RouteStop = "routeStop",
  RouteNextPoint = "routeNextPoint",
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

export const applySources = (map: mapboxgl.Map): void => {
  addSource(map, MapSource.Routes);
  addSource(map, MapSource.RouteStop);
  addSource(map, MapSource.RouteNextPoint);
  addSource(map, MapSource.Pins);
  addSource(map, MapSource.Texts);
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
