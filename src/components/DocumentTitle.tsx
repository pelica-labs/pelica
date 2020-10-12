import Head from "next/head";
import React from "react";

import { useStore } from "~/core/app";

export const DocumentTitle: React.FC = () => {
  const features = useStore((store) => store.mapView.features).map((feature) => feature.text);

  const title = ["Pelica", ...features].join(" · ");

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
