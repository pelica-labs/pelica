import React from "react";

import { Button } from "~/components/Button";
import { aspectRatios } from "~/lib/aspectRatio";
import { useStore } from "~/lib/state";

export const AspectRatioSelector: React.FC = () => {
  const aspectRatio = useStore((store) => store.aspectRatio);
  const dispatch = useStore((store) => store.dispatch);

  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col">
      {Object.entries(aspectRatios).map(([ratio, configuration]) => {
        return (
          <Button
            key={ratio}
            active={aspectRatio === ratio}
            onClick={() => {
              dispatch.closePanes();
              dispatch.setAspectRatio(ratio);
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
