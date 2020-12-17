import { Feature, Geometry } from "@turf/turf";
import { isArray } from "lodash";
import { GeoJSONSource } from "mapbox-gl";
import mapboxgl from "mapbox-gl";

import { ID } from "~/lib/id";
import { MapSource } from "~/map/sources";

export type RawFeature = Feature<Geometry> & {
  id: ID;
  source: MapSource;
};

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

export const parseFeatures = (raw: string): Feature<Geometry>[] => {
  const json = JSON.parse(raw);

  if (isArray(json)) {
    return json;
  }

  if (json.type === "FeatureCollection") {
    return json.features;
  }

  return [json];
};
