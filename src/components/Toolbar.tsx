import React from "react";

import { ToolbarButton } from "~/components/Button";
import {
  ExportIcon,
  FireIcon,
  ImageSizeIcon,
  MousePointerIcon,
  PaintIcon,
  PinIcon,
  RouteIcon,
} from "~/components/Icon";
import { useApp, useStore } from "~/core/app";

export const Toolbar: React.FC = () => {
  const app = useApp();
  const editorMode = useStore((store) => store.editor.mode);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <ToolbarButton
          active={editorMode === "style"}
          className="bg-white text-gray-800 py-2 flex-1 justify-center"
          id="toolbar-style"
          onClick={() => {
            app.editor.setEditorMode("style");
          }}
        >
          <FireIcon className="w-6 h-6" />
        </ToolbarButton>
      </div>

      <div className="flex flex-col space-y-1 mt-6">
        <ToolbarButton
          active={editorMode === "select"}
          id="toolbar-select"
          onClick={() => {
            app.editor.setEditorMode("select");
          }}
        >
          <MousePointerIcon className="w-6 h-6" />
        </ToolbarButton>

        <ToolbarButton
          active={editorMode === "draw"}
          id="toolbar-draw"
          onClick={() => {
            app.editor.setEditorMode("draw");
          }}
        >
          <PaintIcon className="w-6 h-6" />
        </ToolbarButton>

        <ToolbarButton
          active={editorMode === "itinerary"}
          id="toolbar-itinerary"
          onClick={() => {
            app.editor.setEditorMode("itinerary");
          }}
        >
          <RouteIcon className="w-6 h-6" />
        </ToolbarButton>

        <ToolbarButton
          active={editorMode === "pin"}
          id="toolbar-pin"
          onClick={() => {
            app.editor.setEditorMode("pin");
          }}
        >
          <PinIcon className="w-6 h-6" />
        </ToolbarButton>
      </div>

      <div className="flex flex-col space-y-1 mt-6">
        <ToolbarButton
          active={editorMode === "aspectRatio"}
          id="toolbar-aspect-ratio"
          onClick={() => {
            app.editor.setEditorMode("aspectRatio");
          }}
        >
          <ImageSizeIcon className="w-6 h-6" />
        </ToolbarButton>

        <ToolbarButton
          active={editorMode === "export"}
          id="toolbar-export"
          onClick={() => {
            app.editor.setEditorMode("export");
          }}
        >
          <ExportIcon className="w-6 h-6" />
        </ToolbarButton>
      </div>
    </>
  );
};
