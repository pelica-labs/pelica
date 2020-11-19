import React from "react";

import useLocalStorage from "~/hooks/useLocalStorage";

export const CookieConsent: React.FC = () => {
  const [cookieConsent, setCookieConsent] = useLocalStorage("cookie-consent", false);

  if (cookieConsent) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 m-1">
      <div className="mx-auto bg-white rounded shadow flex flex-col sm:flex-row items-start sm:items-center max-w-4xl px-2 py-1 text-sm justify-between space-y-2 sm:space-y-0 sm:space-x-4 border-l-4 border-orange-400">
        <span className="ml-1">
          We use third-party analytics cookies to understand how you use Pelica.co so we can build better products.
        </span>
        <div className="flex items-center justify-between w-full sm:w-auto space-x-4">
          <a className="underline text-orange-600 whitespace-nowrap" href="/privacy">
            Learn more
          </a>
          <a
            className="border border-orange-600 rounded-lg px-2 py-1 hover:bg-orange-100 cursor-pointer"
            onClick={() => {
              setCookieConsent(true);
            }}
          >
            Accept
          </a>
        </div>
      </div>
    </div>
  );
};
