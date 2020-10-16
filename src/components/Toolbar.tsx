import React from "react";

import {
  ExportIcon,
  ImageSizeIcon,
  MousePointerIcon,
  PencilIcon,
  PinIcon,
  RouteIcon,
  StyleIcon,
} from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { useApp, useStore } from "~/core/app";

export const Toolbar: React.FC = () => {
  const app = useApp();
  const editorMode = useStore((store) => store.editor.mode);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <IconButton
          active={editorMode === "style"}
          className="bg-white text-gray-800 py-2 flex-1 justify-center"
          id="toolbar-style"
          onClick={() => {
            app.editor.setEditorMode("style");
          }}
        >
          <StyleIcon className="w-6 h-6" />
        </IconButton>
      </div>

      <div className="flex flex-col space-y-1 mt-6">
        <IconButton
          active={editorMode === "select"}
          id="toolbar-select"
          onClick={() => {
            app.editor.setEditorMode("select");
          }}
        >
          <MousePointerIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "draw"}
          id="toolbar-draw"
          onClick={() => {
            app.editor.setEditorMode("draw");
          }}
        >
          <PencilIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "itinerary"}
          id="toolbar-itinerary"
          onClick={() => {
            app.editor.setEditorMode("itinerary");
          }}
        >
          <RouteIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "pin"}
          id="toolbar-pin"
          onClick={() => {
            app.editor.setEditorMode("pin");
          }}
        >
          <PinIcon className="w-6 h-6" />
        </IconButton>
      </div>

      <div className="flex flex-col space-y-1 mt-6">
        <IconButton
          active={editorMode === "aspectRatio"}
          id="toolbar-aspect-ratio"
          onClick={() => {
            app.editor.setEditorMode("aspectRatio");
          }}
        >
          <ImageSizeIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "export"}
          id="toolbar-export"
          onClick={() => {
            app.editor.setEditorMode("export");
          }}
        >
          <ExportIcon className="w-6 h-6" />
        </IconButton>
      </div>
    </>
  );
};
