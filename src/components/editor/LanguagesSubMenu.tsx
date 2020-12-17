import { Menu } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { LanguageIcon } from "~/components/ui/Icon";
import { app, useStore } from "~/core/app";
import { Languages, MapLanguage } from "~/core/languages";

type Props = {
  onSelect: () => void;
};

export const LanguagesSubMenu: React.FC<Props> = ({ onSelect }) => {
  const language = useStore((store) => store.editor.language);

  return (
    <Menu.Items
      static
      className="fixed top-0 mt-10 mb-16 md:mb-0 md:bottom-auto z-50 left-0 md:left-auto right-0 md:w-56 md:mr-1 origin-top-right bg-white border md:rounded md:shadow outline-none py-1"
    >
      <div className="flex flex-col">
        {Object.entries(Languages).map(([code, label]) => {
          return (
            <Menu.Item key={code}>
              {({ active, disabled }) => (
                <a
                  className={classNames({
                    "flex items-center justify-between px-2 py-1": true,
                    "bg-orange-200": active,
                    "hover:bg-orange-200 cursor-pointer": !disabled,
                    "text-gray-400": disabled,
                  })}
                  onClick={() => {
                    app.editor.setLanguage(code as MapLanguage);
                    onSelect();
                  }}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-sm">{label}</span>
                    {code === language && <LanguageIcon className="w-4 h-4" />}
                  </span>
                </a>
              )}
            </Menu.Item>
          );
        })}
      </div>
    </Menu.Items>
  );
};
