import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

export const Meta: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Head>
      <title>
        {t("pelica")} · ${t("tagline")}
      </title>

      <meta content={t("tagline")} name="Description" />

      <link href="/images/logo.png" rel="shortcut icon" type="image/png" />
      <link href="/images/logo.png" rel="apple-touch-icon" />
    </Head>
  );
};
