import React from "react";

import { Button } from "~/components/Button";
import { AspectRatio, aspectRatios } from "~/lib/aspectRatio";

type Props = {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
};

export const AspectRatioSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col">
      {Object.entries(aspectRatios).map(([ratio, configuration]) => {
        return (
          <Button
            key={ratio}
            active={value === ratio}
            onClick={() => {
              onChange(ratio);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm">{configuration.name}</span>
              {configuration.ratio && (
                <span className="ml-4 text-xs text-gray-500">
                  {configuration.ratio[0]} x {configuration.ratio[1]}
                </span>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};
