import "~/styles/index.css";

import { AppProps } from "next/app";
import React from "react";
import { I18nextProvider } from "react-i18next";

import { Meta } from "~/components/Meta";
import { i18n } from "~/lib/i18n";
import { setupModals } from "~/lib/modals";

setupModals();

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Meta />

      <Component {...pageProps} />
    </I18nextProvider>
  );
};

export default App;
