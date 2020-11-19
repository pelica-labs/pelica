import { Transition } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { app, useStore } from "~/core/app";

export const Alerts: React.FC = () => {
  const alerts = useStore((store) => store.alerts.messages);

  return (
    <Transition
      className="space-y-2 flex flex-col items-center"
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={alerts.length > 0}
    >
      {alerts.map((alert) => {
        return (
          <button
            key={alert.id}
            className={classNames({
              "flex justify-between items-center bg-white text-gray-800 rounded-lg shadow pl-2 pr-3 py-2 border border-l-4 pointer-events-auto text-xs focus:outline-none focus:ring": true,
              [`border-${alert.color}-400`]: true, // @todo: this breaks PurgeCSS
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
      })}
    </Transition>
  );
};
