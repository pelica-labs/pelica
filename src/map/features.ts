import { Feature, Geometry } from "@turf/turf";
import { isArray } from "lodash";
import { GeoJSONSource } from "mapbox-gl";

import { getMap } from "~/core/selectors";
import { ID } from "~/lib/id";
import { MapSource } from "~/map/sources";

export type RawFeature = Feature<Geometry> & {
  id: ID;
  source: MapSource;
};

export const applyFeatures = (features: RawFeature[], sources: MapSource[]): void => {
  const map = getMap();

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
