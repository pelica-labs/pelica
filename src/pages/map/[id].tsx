import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BounceLoader } from "react-spinners";

import { OverlayedLogo } from "~/components/layout/OverlayedLogo";
import { Whoops } from "~/components/layout/Whoops";
import { MapViewer } from "~/components/map/MapViewer";
import { Button } from "~/components/ui/Button";
import { MapModel } from "~/core/db";
import { dynamo } from "~/lib/aws";
import { staticImage } from "~/lib/staticImages";
import { defaultStyle } from "~/map/style";
import { theme } from "~/styles/tailwind";

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

  if (!map.Item || map.Item.deletedAt) {
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
  const router = useRouter();
  const [isCopying, setIsCopying] = useState(false);

  if (!map) {
    return <Whoops statusCode={404} />;
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

  const onCloneMap = async () => {
    setIsCopying(true);

    const res = await fetch("/api/clone-map", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: map.id,
      }),
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  return (
    <>
      <Head>
        <meta key="ogTitle" content={title} property="og:title" />
        <meta key="ogDescription" content={t("tagline")} property="og:description" />
        <meta key="ogImage" content={imageUrl} property="og:image" />
        <meta key="ogUrl" content={currentUrl} property="og:url" />

        <meta key="twitterTitle" content={title} name="twitter:title" />
        <meta key="twitterDescription" content={t("tagline")} name="twitter:description" />
        <meta key="twitterImage" content={imageUrl} name="twitter:image" />
        <meta key="twitterCard" content="summary_large_image" name="twitter:card" />

        <title key="title">{title}</title>
      </Head>

      <MapViewer map={map} />

      <OverlayedLogo />
      <div className="fixed top-0 right-0 mt-20 mr-2">
        <Button
          className="bg-white w-16 justify-center text-sm h-8"
          onClick={() => {
            onCloneMap();
          }}
        >
          {isCopying && <BounceLoader color={theme.colors.orange[500]} size={10} />}
          {!isCopying && "Copy"}
        </Button>
      </div>
    </>
  );
};

export default ViewMap;
