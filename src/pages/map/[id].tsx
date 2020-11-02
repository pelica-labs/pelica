import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { FourOhFour } from "~/components/404";
import { MapViewer } from "~/components/MapViewer";
import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { staticImage } from "~/lib/staticImages";
import { defaultStyle } from "~/lib/style";

type Props = {
  currentUrl: string;
  map: MapModel | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = ctx.query.id as string;
  const currentUrl = ctx.req.headers.host + "/map/" + ctx.query.id;

  const map = await dynamo
    .get({
      TableName: "maps",
      Key: { id },
    })
    .promise();

  if (!map.Item) {
    return { props: { currentUrl, map: null } };
  }

  return {
    props: {
      currentUrl,
      map: map.Item as MapModel,
    },
  };
};

const ViewMap: NextPage<Props> = ({ currentUrl, map }) => {
  const { t } = useTranslation();

  if (!map) {
    return <FourOhFour />;
  }

  const title = [t("pelica"), map.name].filter((text) => !!text).join(" · ");
  const imageUrl = staticImage({
    coordinates: map.coordinates || [2.3522219, 48.856614],
    zoom: map.zoom || 9,
    pitch: map.pitch || 0,
    bearing: map.bearing || 0,
    height: 500,
    width: 1000,
    style: map.style || defaultStyle,
  });

  return (
    <>
      <Head>
        <meta content={title} property="og:title" />
        <meta content={t("tagline")} property="og:description" />
        <meta content={imageUrl} property="og:image" />
        <meta content={currentUrl} property="og:url" />

        <meta content={title} name="twitter:title" />
        <meta content={t("tagline")} name="twitter:description" />
        <meta content={imageUrl} name="twitter:image" />
        <meta content="summary_large_image" name="twitter:card" />

        <title>{title}</title>
      </Head>

      <MapViewer map={map} />
    </>
  );
};

export default ViewMap;
