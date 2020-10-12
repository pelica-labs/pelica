import { BBox, bboxPolygon, booleanWithin } from "@turf/turf";
import Head from "next/head";
import React from "react";

import { useStore } from "~/core/app";

export const DocumentTitle: React.FC = () => {
  const mapBounds = useStore((store) => store.mapView.bounds);
  const features = useStore((store) => store.mapView.features);

  const feature = features
    .filter((feature) => {
      return !feature.place_type.includes("postcode") && !feature.place_type.includes("address");
    })
    .find((feature) => {
      if (!feature.bbox || !mapBounds) {
        return false;
      }

      return booleanWithin(
        bboxPolygon([...mapBounds.getNorthWest().toArray(), ...mapBounds.getSouthEast().toArray()] as BBox),
        bboxPolygon(feature.bbox as BBox)
      );
    });

  const title = ["Pelica", feature?.place_name].filter((text) => !!text).join(" · ");

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
