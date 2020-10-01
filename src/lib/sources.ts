import { AnySourceData } from "mapbox-gl";

export enum MapSource {
  Pins = "pins",
  Routes = "routes",
}

const EmptyGeoJsonSource: AnySourceData = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
};

export const applySources = (map: mapboxgl.Map): void => {
  if (!map.getSource(MapSource.Routes)) {
    map.addSource(MapSource.Routes, EmptyGeoJsonSource);
  }

  if (!map.getSource(MapSource.Pins)) {
    map.addSource(MapSource.Pins, EmptyGeoJsonSource);
  }
};
