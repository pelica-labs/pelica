import React from "react";

import { Button } from "~/components/Button";
import { icons } from "~/components/Icon";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const allIcons = icons();

export const IconSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-wrap w-64">
      {Object.entries(allIcons).map(([iconName, Icon]) => {
        return (
          <Button
            key={iconName}
            active={value === iconName}
            className="w-1/5 py-3"
            onClick={() => {
              onChange(iconName);
            }}
          >
            <div className="flex items-center justify-center w-full">
              <Icon className="w-6 h-6" />
            </div>
          </Button>
        );
      })}
    </div>
  );
};
