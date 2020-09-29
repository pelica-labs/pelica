import classnames from "classnames";
import React from "react";

import { ChevronLeftIcon, FireIcon, HandIcon, PencilIcon } from "~/components/Icon";
import { useMap } from "~/components/MapContext";
import { StyleSelector } from "~/components/StyleSelector";

export const Toolbar: React.FC = () => {
  const { state, toggleStyles, toggleDrawing } = useMap();

  const buttonClasses = classnames({
    "flex items-center py-1 px-2 rounded": true,
    "bg-green-700": state.editor.isShowingStyles,
  });

  return (
    <div className="flex flex-row-reverse items-start">
      <nav className="flex flex-col bg-gray-900 text-gray-200 rounded shadow">
        <div className="relative">
          <button className={buttonClasses} onClick={() => toggleStyles()}>
            <FireIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Styles</span>
          </button>
          {state.editor.isShowingStyles && <ChevronLeftIcon className="absolute w-4 h-4 top-0 left-0 mt-2 -ml-5" />}
        </div>

        <button className="flex items-center py-1 px-2 rounded" onClick={() => toggleDrawing()}>
          <HandIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Move</span>
        </button>

        <button className="flex items-center py-1 px-2 rounded" onClick={() => toggleDrawing()}>
          <PencilIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Draw</span>
        </button>
      </nav>
      {state.editor.isShowingStyles && (
        <div className="mr-6 overflow-y-auto rounded" style={{ maxHeight: "calc(100vh - 16px)" }}>
          <StyleSelector />
        </div>
      )}
    </div>
  );
};
