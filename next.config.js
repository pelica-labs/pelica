/* eslint-disable @typescript-eslint/no-var-requires */

const withSourceMaps = require("@zeit/next-source-maps");

module.exports = withSourceMaps({
  devIndicators: {
    autoPrerender: false,
  },
  env: {
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
  },
  images: {
    domains: ["api.mapbox.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser";
    }

    return config;
  },
});
