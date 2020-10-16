import React from "react";
import { Trans } from "react-i18next";

import { InformationIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";
import { Line } from "~/core/geometries";

export const Tips: React.FC = () => {
  const app = useApp();
  const showRouteModeTip = useStore((store) => {
    const selectedGeometry = store.geometries.items.find(
      (item) => item.id === store.selection.selectedGeometryId
    ) as Line;

    return store.editor.mode === "draw" && selectedGeometry?.points.length > 1;
  });

  if (showRouteModeTip) {
    return (
      <div className="flex justify-between items-center bg-white text-gray-800 rounded-lg shadow pl-2 pr-3 py-2 border border-l-4 border-orange-400 pointer-events-auto">
        <InformationIcon className="w-4 h-4" />

        <div className="flex flex-col text-xs ml-3">
          <span>
            <Trans i18nKey="tips.routeMode.title" />
          </span>

          <span className="text-gray-600">
            <Trans i18nKey="tips.routeMode.tip">
              <a
                className="underline cursor-pointer"
                onClick={() => {
                  app.routes.stopRoute();
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
