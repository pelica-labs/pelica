import "~/styles/index.css";

import { AppProps } from "next/app";
import { useRouter } from "next/dist/client/router";
import React from "react";
import FullStory from "react-fullstory";
import { I18nextProvider } from "react-i18next";

import { Meta } from "~/components/Meta";
import { i18n } from "~/lib/i18n";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  if (router.locale) {
    i18n.changeLanguage(router.locale);
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Meta />

      <FullStory debug={process.env.NODE_ENV !== "production"} org={process.env.FULLSTORY_ORG_ID} />

      <Component {...pageProps} />
    </I18nextProvider>
  );
};

export default App;
