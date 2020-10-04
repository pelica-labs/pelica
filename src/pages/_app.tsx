import "~/styles/index.css";

import { AppProps } from "next/app";
import React from "react";
import ReactTooltip from "react-tooltip";

import { theme } from "~/lib/tailwind";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Component {...pageProps} />
      <ReactTooltip border borderColor={theme.colors.green[500]} delayShow={300} effect="solid" />
    </>
  );
}
