import classNames from "classnames";
import React from "react";

import { RedoIcon, UndoIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";
import { app, useStore } from "~/core/app";

export const HistoryButtons: React.FC = () => {
  const canUndo = useStore((store) => store.history.actions.length > 0);
  const canRedo = useStore((store) => store.history.redoStack.length > 0);

  return (
    <div className="flex flex-col mb-20 ml-2 bg-white border rounded-full">
      <IconButton
        className="rounded-full"
        disabled={!canUndo}
        onClick={() => {
          app.history.undo();
        }}
      >
        <UndoIcon
          className={classNames({
            "w-5 h-5": true,
            "text-gray-400": !canUndo,
          })}
        />
      </IconButton>

      <IconButton
        className="rounded-full"
        disabled={!canRedo}
        onClick={() => {
          app.history.redo();
        }}
      >
        <RedoIcon
          className={classNames({
            "w-5 h-5": true,
            "text-gray-400": !canRedo,
          })}
        />
      </IconButton>
    </div>
  );
};
