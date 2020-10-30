import React from "react";

import { ChevronLeftIcon, HandIcon } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { app, useStore } from "~/core/app";
import { modeIcons } from "~/core/editor";

export const MiniToolbar: React.FC = () => {
  const editorMode = useStore((store) => store.editor.mode);
  const moving = useStore((store) => store.editor.moving);

  const ModeIcon = modeIcons[editorMode];

  return (
    <div className="flex border border-b-0 rounded-tr p-1 items-center divide-x bg-white">
      <IconButton
        className="rounded-full"
        onClick={() => {
          app.editor.setEditorMode("move");
        }}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </IconButton>
      <div className="flex items-center pl-1">
        <IconButton
          active={!moving}
          className="rounded-full"
          onClick={() => {
            app.editor.toggleMoving(false);
          }}
        >
          <ModeIcon className="w-5 h-5" />
        </IconButton>
        <span className="text-gray-300 text-xs mx-1">/</span>

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
  );
};
