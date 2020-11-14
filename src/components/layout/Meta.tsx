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
      <title key="title">{title}</title>

      <meta content={description} name="Description" />

      <link href="/images/icon-512.png" rel="shortcut icon" type="image/png" />
      <link href="/images/icon-512.png" rel="apple-touch-icon" />

      <meta key="description" content={description} name="description" />
      <meta key="ogTitle" content={title} property="og:title" />
      <meta key="ogDescription" content={description} property="og:description" />
      <meta key="ogImage" content={ogImageUrl} property="og:image" />
      <meta key="ogUrl" content={url} property="og:url" />
      <meta key="twitterTitle" content={title} name="twitter:title" />
      <meta key="twitterDescription" content={description} name="twitter:description" />
      <meta key="twitterImage" content={ogImageUrl} name="twitter:image" />
      <meta key="twitterCard" content="summary_large_image" name="twitter:card"></meta>

      <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet" />
    </Head>
  );
};
