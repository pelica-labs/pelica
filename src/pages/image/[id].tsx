import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { LoadingScreen } from "~/components/layout/LoadingScreen";
import { Whoops } from "~/components/layout/Whoops";
import { ImageModel } from "~/core/db";
import { dynamo, s3 } from "~/lib/aws";
import { getEnv } from "~/lib/config";
import { isServer } from "~/lib/ssr";

type Props = {
  status: "uploaded" | "not-found" | "uploading";
  currentUrl: string;
  file?: ImageModel & {
    url: string;
  };
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const currentUrl = ctx.req.headers.host + "/image/" + ctx.query.id;

  const image = await dynamo
    .get({
      TableName: "images",
      Key: { id: ctx.query.id },
    })
    .promise();

  if (!image.Item) {
    return {
      props: { status: "not-found", currentUrl },
    };
  }

  if (!image.Item.path) {
    return {
      props: { status: "uploading", currentUrl },
    };
  }

  const objectParams = {
    Bucket: getEnv("AWS_S3_BUCKET", process.env.AWS_S3_BUCKET),
    Key: image.Item.path,
  };

  const url = s3.getSignedUrl("getObject", objectParams);

  return {
    props: {
      status: "uploaded",
      currentUrl,
      file: {
        url,
        ...(image.Item as ImageModel),
      },
    },
  };
};

const ViewMap: NextPage<Props> = ({ status, currentUrl, file }) => {
  const { t } = useTranslation();

  if (!file && status === "uploading") {
    if (!isServer) {
      // @todo: poll client side
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }

    return (
      <LoadingScreen subTitle="Your map is still uploading. It should be ready in a few seconds!" title="Uploading" />
    );
  }

  if (!file) {
    return <Whoops statusCode={404} />;
  }

  const title = [t("pelica"), file.name].filter((text) => !!text).join(" · ");

  return (
    <div className="bg-gray-900 h-screen p-4">
      <Head>
        <meta key="title" content={title} property="og:title" />
        <meta key="ogDescription" content={t("tagline")} property="og:description" />
        <meta key="ogImage" content={file.url} property="og:image" />
        <meta key="ogUrl" content={currentUrl} property="og:url" />

        <meta key="twitterTitle" content={title} name="twitter:title" />
        <meta key="twitterDescription" content={t("tagline")} name="twitter:description" />
        <meta key="twitterImage" content={file.url} name="twitter:image" />
        <meta key="twitterCard" content="summary_large_image" name="twitter:card" />

        <title key="title">{title}</title>
      </Head>

      <img className="object-contain m-auto w-full h-full" src={file.url} />
    </div>
  );
};

export default ViewMap;
