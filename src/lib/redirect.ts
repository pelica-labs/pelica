import { ServerResponse } from "http";

import { isServer } from "~/lib/ssr";

export type EmptyProps = Record<string, unknown>;

export const redirect = (res: ServerResponse, to: string): { props: EmptyProps } => {
  res.statusCode = 302;
  res.setHeader("Location", to);

  return { props: {} };
};

/**
 * Client-side redirect the user to the https version of the application.
 *
 * ⚠️ This should be done server side, ideally with a reverse proxy
 * ⚠️ but I can't manage to do it with Elastic Beanstalk
 */
export const redirectToHttps = (): void => {
  if (process.env.NODE_ENV === "development" || isServer) {
    return;
  }

  if (window.location.protocol === "http:") {
    window.location.replace(window.location.href.replace(/^http:/, "https:"));
  }
};
