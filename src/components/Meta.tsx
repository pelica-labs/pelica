import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

export const Meta: React.FC = () => {
  const { t } = useTranslation();

  const ogImageUrl = "https://pelica.co/images/og-image.jpg";
  const url = "https://pelica.co";
  const description = t("tagline");
  const title = `${t("pelica")} · ${t("tagline")}`;

  return (
    <Head>
      <title>{title}</title>

      <meta content={description} name="Description" />
      <meta content="user-scalable=no" name="viewport" />

      <link href="/images/icon-512.png" rel="shortcut icon" type="image/png" />
      <link href="/images/icon-512.png" rel="apple-touch-icon" />

      <meta content={description} name="description" />
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={ogImageUrl} property="og:image" />
      <meta content={url} property="og:url" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={ogImageUrl} name="twitter:image" />
      <meta content="summary_large_image" name="twitter:card"></meta>
      <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet" />
    </Head>
  );
};
