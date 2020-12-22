import classNames from "classnames";
import React from "react";

import { ExportButton } from "~/components/editor/ExportButton";
import { MapMenu } from "~/components/editor/MapMenu";
import { SyncIndicator } from "~/components/editor/SyncIndicator";
import { UserMenu } from "~/components/editor/UserMenu";
import { ButtonLabel } from "~/components/ui/ButtonLabel";
import { app, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";
import { useLayout } from "~/hooks/useLayout";

export const MenuBar: React.FC = () => {
  const editorMenuMode = useStore((store) => store.editor.menuMode);
  const layout = useLayout();

  useHotkey({ key: "e" }, () => {
    app.editor.setEditorMenuMode("export");
  });
  useHotkey({ key: "a" }, () => {
    app.editor.setEditorMenuMode("share");
  });

  return (
    <div
      className={classNames({
        "relative flex justify-between items-center h-12 px-2 w-full": true,
        "bg-gray-800": layout.horizontal,
      })}
    >
      <div className="flex-1 flex items-center space-x-1 relative">
        <ExportButton />
        <button
          className={classNames({
            "group flex items-center rounded py-1 px-2 border focus:outline-none": true,
            "hover:bg-gray-600 border-gray-600 hover:border-gray-600": editorMenuMode !== "share",
            "bg-orange-200 hover:bg-orange-300 border-orange-300 hover:border-orange-400 text-gray-800":
              editorMenuMode === "share",
            "text-white": layout.horizontal,
          })}
          onClick={() => {
            app.editor.setEditorMenuMode("share");
          }}
        >
          <ButtonLabel className="text-xs" hotkey="a" label="Share" />
        </button>
      </div>

      {layout.horizontal && (
        <div className="right-0 mr-4">
          <SyncIndicator />
        </div>
      )}

      {layout.horizontal && (
        <div className="flex items-center space-x-1">
          <MapMenu />
          <UserMenu />
        </div>
      )}
    </div>
  );
};
