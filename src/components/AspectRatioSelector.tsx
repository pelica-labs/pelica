import React from "react";

import { Button } from "~/components/Button";
import { AspectRatio, aspectRatios } from "~/lib/aspectRatio";

type Props = {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
};

export const AspectRatioSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-1 lg:flex-col h-full">
      {Object.entries(aspectRatios).map(([ratio, configuration]) => {
        return (
          <Button
            key={ratio}
            active={value === ratio}
            className="border lg:rounded-none"
            shadow={false}
            onClick={() => {
              onChange(ratio);
            }}
          >
            <div className="flex items-center justify-between w-32 lg:w-full">
              <configuration.icon className="w-6 h-6" />

              <div className="flex flex-col items-end">
                <span className="text-xs flex-1 text-left ml-2 whitespace-no-wrap">{configuration.name}</span>
                {configuration.ratio && (
                  <span className="ml-2 lg:ml-4 text-xs text-gray-600 whitespace-no-wrap">
                    {configuration.ratio[0]} × {configuration.ratio[1]}
                  </span>
                )}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
