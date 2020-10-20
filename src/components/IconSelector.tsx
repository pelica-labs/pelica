import React, { useState } from "react";

import { Button } from "~/components/Button";
import { icons } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { useClickOutside } from "~/hooks/useClickOutside";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const allIcons = icons();

export const IconSelector: React.FC<Props> = ({ value, onChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonContainer = useClickOutside<HTMLDivElement>(() => {
    // @todo: find a way to cleanup
    setTimeout(() => {
      setShowMenu(false);
    }, 50);
  });

  const SelectedIcon = allIcons[value];

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
            <span className="ml-2 text-gray-600 text-xs">{value}</span>
          </div>
        </Button>
      </div>

      {showMenu && (
        <div className="absolute left-0 top-0 mt-6 bg-white text-gray-800 rounded border flex flex-wrap pl-1 pb-1 shadow">
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
