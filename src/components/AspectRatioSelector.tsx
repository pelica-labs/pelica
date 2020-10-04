import React from "react";

import { Button } from "~/components/Button";
import { useStore } from "~/lib/state";

export const AspectRatioSelector: React.FC = () => {
  const aspectRatio = useStore((store) => store.aspectRatio);
  const dispatch = useStore((store) => store.dispatch);

  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col">
      <Button
        active={aspectRatio === "fill"}
        onClick={() => {
          dispatch.closePanes();
          dispatch.setAspectRatio("fill");
        }}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm">Fill</span>
          <span className="text-xs text-gray-500">Use the entire available space</span>
        </div>
      </Button>

      <Button
        active={aspectRatio === "square"}
        onClick={() => {
          dispatch.closePanes();
          dispatch.setAspectRatio("square");
        }}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm">Square</span>
          <span className="text-xs text-gray-500">Suited for social network sharing</span>
        </div>
      </Button>
    </div>
  );
};
