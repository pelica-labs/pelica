import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { LoadingScreen } from "~/components/LoadingScreen";
import { getEnv } from "~/lib/config";
import { generateFilePrefix, s3 } from "~/lib/s3";
import { isServer } from "~/lib/ssr";

type Props = {
  currentUrl: string;
  file?: {
    url: string;
    metadata: {
      name: string | null;
    };
  };
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const path = generateFilePrefix("maps") + ctx.query.id + ".jpeg";
  const currentUrl = ctx.req.headers.host + "/image/" + ctx.query.id;

  const objectParams = {
    Bucket: getEnv("AWS_S3_BUCKET", process.env.AWS_S3_BUCKET),
    Key: path,
  };

  const file = await s3
    .getObject(objectParams)
    .promise()
    .catch((error) => {
      console.warn("Failed to fetch file from s3", error);
    });

  if (!file) {
    return {
      props: { currentUrl },
    };
  }

  const url = s3.getSignedUrl("getObject", objectParams);

  return {
    props: {
      currentUrl,
      file: {
        url,
        metadata: {
          name: file.Metadata?.name ?? null,
        },
      },
    },
  };
};

const ViewMap: NextPage<Props> = ({ currentUrl, file }) => {
  const { t } = useTranslation();

  if (!file) {
    if (!isServer) {
      // @todo: poll client side
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }

    return <LoadingScreen subTitle="It might still be uploading" title="Map not found" />;
  }

  const title = [t("pelica"), file.metadata.name].filter((text) => !!text).join(" · ");

  return (
    <div className="bg-gray-900 h-screen p-4">
      <Head>
        <meta content={title} property="og:title" />
        <meta content={t("tagline")} property="og:description" />
        <meta content={file.url} property="og:image" />
        <meta content={currentUrl} property="og:url" />

        <meta content={title} name="twitter:title" />
        <meta content={t("tagline")} name="twitter:description" />
        <meta content={file.url} name="twitter:image" />
        <meta content="summary_large_image" name="twitter:card" />

        <title>{title}</title>
      </Head>

      <img className="object-contain m-auto w-full h-full" src={file.url} />
    </div>
  );
};

export default ViewMap;
