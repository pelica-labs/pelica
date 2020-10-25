import Head from "next/head";
import React from "react";
import { useTranslation } from "react-i18next";

import { useStore } from "~/core/app";
import { getMapTitle } from "~/core/selectors";

export const DocumentTitle: React.FC = () => {
  const { t } = useTranslation();
  const mapTitle = useStore((store) => getMapTitle(store));

  const title = [mapTitle, t("pelica")].filter((text) => !!text).join(" · ");

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
};
