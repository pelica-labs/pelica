import React from "react";

import { Button } from "~/components/Button";
import { AspectRatio, aspectRatios } from "~/lib/aspectRatio";

type Props = {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
};

export const AspectRatioSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col">
      {Object.entries(aspectRatios).map(([ratio, configuration]) => {
        return (
          <Button
            key={ratio}
            active={value === ratio}
            className="rounded-none"
            rounded={false}
            shadow={false}
            onClick={() => {
              onChange(ratio);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <configuration.icon className="w-6 h-6" />

              <span className="text-xs flex-1 text-left ml-2">{configuration.name}</span>
              {configuration.ratio && (
                <span className="ml-4 text-xs text-gray-600">
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
