import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { getEnv } from "~/lib/config";
import { generateFilePrefix, s3 } from "~/lib/s3";

type Props = {
  file?: {
    url: string;
    metadata: {
      name: string | null;
    };
  };
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const path = generateFilePrefix("maps") + ctx.query.hash + ".jpeg";

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
    return { props: {} };
  }

  const url = s3.getSignedUrl("getObject", objectParams);

  return {
    props: {
      file: {
        url,
        metadata: {
          name: file.Metadata?.name ?? null,
        },
      },
    },
  };
};

const ViewMap: NextPage<Props> = ({ file }) => {
  const { t } = useTranslation();

  if (!file) {
    // @todo: 404 page
    return <div>Map not found</div>;
  }

  const title = [t("pelica"), file.metadata.name].filter((text) => !!text).join(" · ");

  return (
    <div className="bg-gray-200 h-full py-6">
      <Head>
        <meta content={title} property="og:title" />
        <meta content="Create stunning maps in minutes" property="og:description" />
        <meta content={file.url} property="og:image" />
        <meta content={file.url} property="og:url" />

        <title>{title}</title>
      </Head>

      <img className="h-full m-auto border-gray-400 shadow-md border" src={file.url} />
    </div>
  );
};

export default ViewMap;
