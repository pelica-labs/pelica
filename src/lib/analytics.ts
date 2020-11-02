import ReactGA from "react-ga";

const isDevelopment = process.env.NODE_ENV === "development";

export const initAnalytics = (): void => {
  if (isDevelopment) return;

  if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);
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
