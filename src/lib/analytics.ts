import ReactGA from "react-ga";

const NODE_ENV = process.env.NODE_ENV;
const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;

const isDevelopment = NODE_ENV === "development";

export const initAnalytics = (): void => {
  if (isDevelopment) return;

  if (GOOGLE_ANALYTICS_ID) {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID);
  }
};

export const logPageView = (): void => {
  if (isDevelopment) return;

  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};

export const logEvent = (category: string, action: string, options = {}): void => {
  if (isDevelopment) return;

  ReactGA.event({ category, action, ...options });
};
