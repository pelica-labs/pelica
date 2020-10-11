import React from "react";

import { InformationIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";

export const Tips: React.FC = () => {
  const app = useApp();
  const currentLine = useStore((store) => store.line.currentLine);

  if (!currentLine) {
    return null;
  }

  return (
    <div className="flex justify-between items-center bg-gray-900 text-gray-200 rounded-lg shadow pl-2 pr-3 py-2 border border-l-4 border-green-600">
      <InformationIcon className="w-4 h-4" />
      <div className="flex flex-col text-xs ml-3">
        <span>Draw mode</span>
        <span className="text-gray-500">Tap the last point to end your route.</span>
        <a className="text-gray-500">
          (or tap{" "}
          <a
            className="underline cursor-pointer"
            onClick={() => {
              app.line.stopDrawing();
            }}
          >
            right here
          </a>
          )
        </a>
      </div>
    </div>
  );
};
