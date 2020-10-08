import "~/styles/index.css";

import { AppProps } from "next/app";
import React from "react";

import { setupModals } from "~/lib/modals";

setupModals();

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />;
}
