import { capitalize, snakeCase } from "lodash";
import React, { useState } from "react";

import { Button } from "~/components/ui/Button";
import {
  BanIcon,
  ClassicalPinIcon,
  DiamondPinIcon,
  Icon,
  PeakyPinIcon,
  PelipinIcon,
  RoundPinIcon,
  SquaredClassicalPinIcon,
  SquaredPeakyPinIcon,
  SquaredPelipinIcon,
  SquaredPinIcon,
} from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";
import { useClickOutside } from "~/hooks/useClickOutside";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  onChangeComplete: (value: string | null) => void;
};

const allPins: { [key: string]: Icon } = {
  pelipin: PelipinIcon,
  classical: ClassicalPinIcon,
  peaky: PeakyPinIcon,
  round: RoundPinIcon,
  squaredPelipin: SquaredPelipinIcon,
  squaredClassical: SquaredClassicalPinIcon,
  squaredPeaky: SquaredPeakyPinIcon,
  squared: SquaredPinIcon,
  diamond: DiamondPinIcon,
};

export const PinSelector: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonContainer = useClickOutside<HTMLDivElement>(() => {
    // @todo: find a way to cleanup
    setTimeout(() => {
      setShowMenu(false);
    }, 50);
  });

  const SelectedPin = value ? allPins[value] : null;
  const label = value ? capitalize(snakeCase(value).replace("_", " ")) : "No pin";

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
            {SelectedPin && <SelectedPin className="w-4 h-4 mr-2" />}
            <span className="text-gray-600 text-xs">{label}</span>
          </div>
        </Button>
      </div>

      {showMenu && (
        <div className="fixed bottom-0 md:bottom-auto md:absolute left-0 right-0 md:right-auto md:top-0 mt-8 bg-white text-gray-800 md:rounded border flex flex-wrap pl-1 pb-1 shadow z-50 w-full md:w-40 xl:w-48">
          {Object.entries(allPins).map(([iconName, Icon]) => {
            return (
              <div key={iconName} className="w-1/5 px-1 pt-1 flex justify-center">
                <IconButton
                  active={value === iconName}
                  onClick={() => {
                    onChangeComplete(iconName);
                  }}
                  onMouseEnter={() => {
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
          <div className="w-1/5 px-1 pt-1 flex justify-center">
            <IconButton
              active={!value}
              onClick={() => {
                onChangeComplete(null);
              }}
              onMouseEnter={() => {
                onChange(null);
              }}
            >
              <div className="flex items-center justify-center w-full">
                <BanIcon className="w-4 h-4 text-gray-400" />
              </div>
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};
