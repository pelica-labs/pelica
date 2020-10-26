import { capitalize, snakeCase } from "lodash";
import React, { useState } from "react";

import { Button } from "~/components/Button";
import { pinIcons } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { useClickOutside } from "~/hooks/useClickOutside";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const allIcons = pinIcons();

export const PinSelector: React.FC<Props> = ({ value, onChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonContainer = useClickOutside<HTMLDivElement>(() => {
    // @todo: find a way to cleanup
    setTimeout(() => {
      setShowMenu(false);
    }, 50);
  });

  const SelectedIcon = allIcons[value];
  const label = capitalize(snakeCase(value).replace("_", " "));

  return (
    <div className="relative">
      <div ref={buttonContainer}>
        <Button
          className="mt-2"
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <div className="flex items-start">
            <SelectedIcon className="w-4 h-4" />
            <span className="ml-2 text-gray-600 text-xs">{label}</span>
          </div>
        </Button>
      </div>

      {showMenu && (
        <div className="fixed bottom-0 md:bottom-auto md:absolute left-0 right-0 md:right-auto md:top-0 mt-8 bg-white text-gray-800 md:rounded border flex flex-wrap pl-1 pb-1 shadow z-50 w-full md:w-40 xl:w-48">
          {Object.entries(allIcons).map(([iconName, Icon]) => {
            return (
              <div key={iconName} className="w-1/5 px-1 pt-1">
                <IconButton
                  active={value === iconName}
                  onClick={() => {
                    onChange(iconName);
                  }}
                >
                  <div className="flex items-center justify-center w-full">
                    <Icon className="w-4 h-4" />
                  </div>
                </IconButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
