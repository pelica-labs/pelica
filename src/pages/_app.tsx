import "~/styles/index.css";

import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

import { setupModals } from "~/lib/modals";

setupModals();

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Pelica</title>
        <link href="/images/logo.png" rel="shortcut icon" type="image/png" />
        <link href="/images/logo.png" rel="apple-touch-icon" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
