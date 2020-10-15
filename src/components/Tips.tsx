import React from "react";
import { Trans } from "react-i18next";

import { InformationIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";

export const Tips: React.FC = () => {
  const app = useApp();
  const currentRoute = useStore((store) => store.routes.currentRoute);

  if (currentRoute) {
    return (
      <div className="flex justify-between items-center bg-gray-900 text-gray-200 rounded-lg shadow pl-2 pr-3 py-2 border border-l-4 border-orange-600 pointer-events-auto">
        <InformationIcon className="w-4 h-4" />

        <div className="flex flex-col text-xs ml-3">
          <span>
            <Trans i18nKey="tips.routeMode.title" />
          </span>

          <span className="text-gray-500">
            <Trans i18nKey="tips.routeMode.tip">
              <a
                className="underline cursor-pointer"
                onClick={() => {
                  app.routes.stopDrawing();
                }}
              />
            </Trans>
          </span>
        </div>
      </div>
    );
  }

  return null;
};
