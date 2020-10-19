import { Transition } from "@headlessui/react";
import classNames from "classnames";
import React from "react";
import { Trans } from "react-i18next";

import { InformationIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";
import { Route } from "~/core/routes";
import { getSelectedEntity } from "~/core/selectors";

export const Alerts: React.FC = () => {
  const app = useApp();
  const alerts = useStore((store) => store.alerts.messages);
  const showRouteModeTip = useStore((store) => {
    const selectedEntity = getSelectedEntity(store) as Route;

    return store.editor.mode === "draw" && selectedEntity?.points.length > 1;
  });

  const sections = [];

  if (showRouteModeTip) {
    sections.push(
      <div
        key="route-mode"
        className="flex justify-between items-center bg-white text-gray-800 rounded-lg shadow pl-2 pr-3 py-2 border border-l-4 border-orange-400 pointer-events-auto"
      >
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

  alerts.forEach((alert) => {
    sections.push(
      <button
        key={alert.id}
        className={classNames({
          "flex justify-between items-center bg-white text-gray-800 rounded-lg shadow pl-2 pr-3 py-2 border border-l-4 pointer-events-auto text-xs focus:outline-none focus:shadow-outline": true,
          [`border-${alert.color}-400`]: true,
        })}
        onClick={() => {
          app.alerts.dismiss(alert.id);
        }}
      >
        <alert.icon
          className={classNames({
            "w-4 h-4": true,
            [`text-${alert.color}-600`]: true,
          })}
        />
        <span className="ml-2 whitespace-pre-line">{alert.message}</span>
      </button>
    );
  });

  return (
    <Transition
      className="space-y-2 flex flex-col items-center"
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={sections.length > 0}
    >
      {sections}
    </Transition>
  );
};
