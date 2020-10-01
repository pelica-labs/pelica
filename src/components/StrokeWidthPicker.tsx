import classnames from "classnames";
import range from "lodash/range";
import React from "react";

import { useStore } from "~/lib/state";

export const StrokeWidthPicker: React.FC = () => {
  const strokeWidth = useStore((store) => store.editor.strokeWidth);
  const color = useStore((store) => store.editor.strokeColor);
  const dispatch = useStore((store) => store.dispatch);

  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col">
      {range(1, 11).map((value) => {
        const isStrokeSelected = value === strokeWidth;
        const linkClasses = classnames({
          "flex items-center px-2 py-1 rounded cursor-pointer": true,
          "hover:bg-green-900": !isStrokeSelected,
          "bg-green-700": isStrokeSelected,
        });

        return (
          <a
            key={value}
            className={linkClasses}
            onClick={() => {
              dispatch.setStrokeWidth(value);
              dispatch.togglePane("strokeWidth");
            }}
          >
            <span className="mr-3">
              {value}
              <span className="ml-1 text-sm text-gray-400">px</span>
            </span>
            <div className="flex justify-center items-center ml-auto w-4 h-4 bg-gray-200 rounded-full">
              <div
                className="rounded-full"
                style={{ width: `${value}px`, height: `${value}px`, backgroundColor: color }}
              />
            </div>
          </a>
        );
      })}
    </div>
  );
};
