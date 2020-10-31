import "~/styles/index.css";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import NextApp from "next/app";
import React, { ErrorInfo } from "react";
import FullStory from "react-fullstory";
import { I18nextProvider } from "react-i18next";

import { Meta } from "~/components/Meta";
import { getState } from "~/core/app";
import { getSerializableState } from "~/core/selectors";
import { i18n } from "~/lib/i18n";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1,
});

class App extends NextApp {
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const state = getSerializableState(getState());

    Sentry.withScope((scope) => {
      scope.setExtra("pelica", state);

      Object.keys(errorInfo).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scope.setExtra(key, errorInfo[key]);
      });

      Sentry.captureException(error);
    });

    super.componentDidCatch(error, errorInfo);
  }

  render(): JSX.Element {
    const { Component, pageProps, router } = this.props;

    if (router.locale) {
      i18n.changeLanguage(router.locale);
    }

    return (
      <I18nextProvider i18n={i18n}>
        <Meta />

        <FullStory org={process.env.NEXT_PUBLIC_FULLSTORY_ORG_ID} />

        <Component {...pageProps} />
      </I18nextProvider>
    );
  }
}

export default App;
