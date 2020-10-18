import { BBox, bboxPolygon, booleanWithin } from "@turf/turf";
import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { useStore } from "~/core/app";

export const DocumentTitle: React.FC = () => {
  const { t } = useTranslation();
  const mapBounds = useStore((store) => store.map.bounds);
  const features = useStore((store) => store.map.features);

  const feature = features
    .filter((feature) => {
      return !feature.place_type.includes("postcode") && !feature.place_type.includes("address");
    })
    .find((feature) => {
      if (!feature.bbox || !mapBounds) {
        return false;
      }

      return booleanWithin(bboxPolygon(mapBounds), bboxPolygon(feature.bbox as BBox));
    });

  const title = [t("pelica"), feature?.place_name].filter((text) => !!text).join(" · ");

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
