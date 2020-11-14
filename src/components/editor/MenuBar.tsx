import classNames from "classnames";
import React from "react";

import { MapMenu } from "~/components/editor/MapMenu";
import { SyncIndicator } from "~/components/editor/SyncIndicator";
import { UserMenu } from "~/components/editor/UserMenu";
import { DownloadIcon } from "~/components/ui/Icon";
import { app, useStore } from "~/core/app";

export const MenuBar: React.FC = () => {
  const editorMenuMode = useStore((store) => store.editor.menuMode);

  return (
    <div className="relative flex justify-between items-center bg-gray-800 h-12 px-2 w-full">
      <div className="flex-1 flex items-center space-x-1 relative">
        <button
          className={classNames({
            "flex items-center rounded py-1 px-2 text-white border  focus:outline-none focus:border-orange-300 space-x-1 mr-px": true,
            "bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-500": !editorMenuMode,
            "hover:bg-gray-600 border-gray-600 hover:border-gray-600": editorMenuMode === "share",
            "bg-orange-200 hover:bg-orange-300 border-orange-300 hover:border-orange-400 text-gray-800":
              editorMenuMode === "export",
          })}
          onClick={() => {
            app.editor.setEditorMenuMode("export");
          }}
        >
          <DownloadIcon className="w-4 h-4" />
          <span className="text-xs">Export</span>
        </button>
        <button
          className={classNames({
            "flex items-center rounded py-1 px-2 text-white border focus:outline-none": true,
            "hover:bg-gray-600 border-gray-600 hover:border-gray-600": editorMenuMode !== "share",
            "bg-orange-200 hover:bg-orange-300 border-orange-300 hover:border-orange-400 text-gray-800":
              editorMenuMode === "share",
          })}
          onClick={() => {
            app.editor.setEditorMenuMode("share");
          }}
        >
          <span className="text-xs">Share</span>
        </button>
      </div>

      <div className="right-0 mr-4">
        <SyncIndicator />
      </div>

      <div className="flex items-center space-x-1">
        <MapMenu />
        <UserMenu />
      </div>
    </div>
  );
};
