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
    domains: ["api.mapbox.com", "lh3.googleusercontent.com", "pelica.s3.eu-west-3.amazonaws.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser";

      config.node.fs = "empty";
    }

    return config;
  },
});
