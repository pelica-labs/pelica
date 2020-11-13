import classNames from "classnames";
import React from "react";

import { DownloadIcon } from "~/components/Icon";
import { MapMenu } from "~/components/MapMenu";
import { SyncIndicator } from "~/components/SyncIndicator";
import { UserMenu } from "~/components/UserMenu";
import { app, useStore } from "~/core/app";

export const MenuBar: React.FC = () => {
  return (
    <div className="py-1 flex justify-between items-center bg-white md:bg-gray-200 px-2 md:w-full md:shadow-2xl bg-opacity-95 rounded-bl md:rounded-none md:bg-opacity-100">
      <EditorMenuButtons />

      <div className="right-0 ml-2 mr-4">
        <SyncIndicator />
      </div>

      <div className="flex items-center space-x-1">
        <MapMenu />
        <UserMenu />
      </div>
    </div>
  );
};

export const EditorMenuButtons: React.FC = () => {
  const editorMenuMode = useStore((store) => store.editor.menuMode);

  return (
    <div className="flex-1 flex items-center space-x-4 md:space-x-2 relative">
      <button
        className={classNames({
          "flex items-center rounded py-2 md:py-1 px-2 text-white border focus:outline-none focus:border-orange-300 space-x-1": true,
          "bg-blue-700 hover:bg-blue-600 border-blue-600 hover:border-blue-600": !editorMenuMode,
          "bg-gray-600 hover:bg-gray-500 border-gray-400 hover:border-gray-400": editorMenuMode === "share",
          "bg-orange-400 hover:bg-orange-500 border-orange-300 hover:border-orange-400": editorMenuMode === "export",
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
          "flex items-center rounded py-2 md:py-1 px-2 text-white border focus:outline-none": true,
          "bg-gray-600 hover:bg-gray-500 border-gray-400 hover:border-gray-400": editorMenuMode !== "share",
          "bg-orange-400 hover:bg-orange-500 border-orange-300 hover:border-orange-400": editorMenuMode === "share",
        })}
        onClick={() => {
          app.editor.setEditorMenuMode("share");
        }}
      >
        <span className="text-xs">Share</span>
      </button>
    </div>
  );
};
