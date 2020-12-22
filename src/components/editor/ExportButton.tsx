import classNames from "classnames";
import React from "react";
import { ButtonLabel } from "~/components/ui/ButtonLabel";
import { DownloadIcon } from "~/components/ui/Icon";
import { app, useStore } from "~/core/app";

export const ExportButton = () => {
  const editorMenuMode = useStore((store) => store.editor.menuMode);

  return (<button
    className={classNames({
      "group flex items-center rounded py-1 px-2 border focus:outline-none focus:border-orange-300 space-x-1 mr-px text-white": true,
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
    <ButtonLabel className="text-xs" label="Export" />
  </button>)
}