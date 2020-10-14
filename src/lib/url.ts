import { getEnv } from "~/lib/config";
import { isClient } from "~/lib/ssr";

export const getBaseUrl = (): string => {
  if (isClient) {
    return `${window.location.protocol}//${window.location.host}`;
  }

  const scheme = process.env.NODE_ENV === "production" ? "https" : "http";
  const url = getEnv("APP_URL", process.env.APP_URL || process.env.VERCEL_URL);

  return `${scheme}://${url}`;
};
