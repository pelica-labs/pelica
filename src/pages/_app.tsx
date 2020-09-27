import "../styles/index.css";

import React from "react";

export default function App({ Component, pageProps }): JSX.Element {
  return <Component {...pageProps} />;
}
