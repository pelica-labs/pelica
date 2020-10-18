import { Feature, Geometry } from "@turf/turf";
import { GeoJSONSource } from "mapbox-gl";

import { MapSource } from "~/map/sources";

export type RawFeature = Feature<Geometry> & { id: number; source: MapSource };

export const applyFeatures = (map: mapboxgl.Map, features: RawFeature[], sources: MapSource[]): void => {
  sources.forEach((sourceId) => {
    const source = map.getSource(sourceId) as GeoJSONSource;
    if (!source) {
      return;
    }

    const featuresForSource = features.filter((feature) => {
      return feature.source === sourceId;
    });

    source.setData({
      type: "FeatureCollection",
      features: featuresForSource,
    } as GeoJSON.FeatureCollection<GeoJSON.Geometry>);
  });
};
