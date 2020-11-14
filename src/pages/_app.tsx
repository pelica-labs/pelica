import "~/styles/index.css";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { Provider } from "next-auth/client";
import NextApp, { NextWebVitalsMetric } from "next/app";
import Router from "next/router";
import NProgress from "nprogress";
import React, { ErrorInfo } from "react";
import FullStory from "react-fullstory";
import { I18nextProvider } from "react-i18next";

import { Meta } from "~/components/layout/Meta";
import { getState } from "~/core/app";
import { getSerializableState } from "~/core/selectors";
import { initAnalytics, logEvent, logPageView } from "~/lib/analytics";
import { i18n } from "~/lib/i18n";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1,
});

Router.events.on("routeChangeComplete", () => {
  logPageView();
});

let nprogressTimeout: NodeJS.Timeout | null = null;
NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => {
  nprogressTimeout = setTimeout(() => {
    NProgress.start();
  }, 200);
});

Router.events.on("routeChangeComplete", () => {
  if (nprogressTimeout) {
    clearTimeout(nprogressTimeout);
  }
  NProgress.done();
});

Router.events.on("routeChangeError", () => {
  if (nprogressTimeout) {
    clearTimeout(nprogressTimeout);
  }
  NProgress.done();
});

class App extends NextApp {
  componentDidMount(): void {
    initAnalytics();
  }

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

      logEvent("Web", "Error");
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

        <Provider session={pageProps.session}>
          <Component {...pageProps} />
        </Provider>
      </I18nextProvider>
    );
  }
}

export const reportWebVitals = ({ id, name, label, value }: NextWebVitalsMetric): void => {
  logEvent(`${label} metric`, name, {
    value: Math.round(name === "CLS" ? value * 1000 : value),
    label: id,
    nonInteraction: true,
  });
};

export default App;
