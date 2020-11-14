import classNames from "classnames";
import React from "react";

import { ChevronLeftIcon, ChevronRightLightIcon, HandIcon } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { app, useStore } from "~/core/app";
import { modeIcons } from "~/core/editor";
import { getSelectedEntity } from "~/core/selectors";

export const MiniToolbar: React.FC = () => {
  const editorMode = useStore((store) => store.editor.mode);
  const moving = useStore((store) => store.editor.isMoving);
  const selectedEntity = useStore((store) => getSelectedEntity(store));

  const ModeIcon = modeIcons[editorMode];
  const rootMode =
    selectedEntity?.type === "Pin"
      ? "pin"
      : selectedEntity?.type === "Text"
      ? "text"
      : selectedEntity?.type === "Route" && selectedEntity.itinerary
      ? "itinerary"
      : selectedEntity?.type === "Route"
      ? "route"
      : null;
  const RootModeIcon = rootMode ? modeIcons[rootMode] : null;

  return (
    <div className="flex border border-b-0 rounded-tr p-1 items-center divide-x bg-gray-100 border-gray-300">
      <IconButton
        className="rounded-full"
        onClick={() => {
          app.editor.setEditorMode("move");
        }}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </IconButton>

      <div className="flex items-center pl-1">
        {rootMode && editorMode === "select" && (
          <>
            <IconButton
              className="rounded-full"
              onClick={() => {
                app.editor.setEditorMode(rootMode);
              }}
            >
              {RootModeIcon && <RootModeIcon className="w-5 h-5" />}
            </IconButton>
            <ChevronRightLightIcon className="text-gray-300 w-4 h-4" />
          </>
        )}

        <div
          className={classNames({
            "flex items-center": true,
            "flex-row-reverse": rootMode && editorMode === "select",
          })}
        >
          <IconButton
            active={!moving}
            className="rounded-full"
            onClick={() => {
              app.editor.toggleMoving(false);
            }}
          >
            <ModeIcon className="w-5 h-5" />
          </IconButton>

          <IconButton
            active={moving}
            className="rounded-full"
            onClick={() => {
              app.editor.toggleMoving(true);
            }}
          >
            <HandIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
