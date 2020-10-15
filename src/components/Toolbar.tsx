import React from "react";

import { Button } from "~/components/Button";
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
        <Button
          active={editorMode === "style"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-style"
          onClick={() => {
            app.editor.setEditorMode("style");
          }}
        >
          <FireIcon className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex flex-col space-y-1 mt-6">
        <Button
          active={editorMode === "select"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-select"
          onClick={() => {
            app.editor.setEditorMode("select");
          }}
        >
          <MousePointerIcon className="w-6 h-6" />
        </Button>

        <Button
          active={editorMode === "draw"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-draw"
          onClick={() => {
            app.editor.setEditorMode("draw");
          }}
        >
          <PaintIcon className="w-6 h-6" />
        </Button>

        <Button
          active={editorMode === "itinerary"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-itinerary"
          onClick={() => {
            app.editor.setEditorMode("itinerary");
          }}
        >
          <RouteIcon className="w-6 h-6" />
        </Button>

        <Button
          active={editorMode === "pin"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-pin"
          onClick={() => {
            app.editor.setEditorMode("pin");
          }}
        >
          <PinIcon className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex flex-col space-y-1 mt-6">
        <Button
          active={editorMode === "aspectRatio"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-aspect-ratio"
          onClick={() => {
            app.editor.setEditorMode("aspectRatio");
          }}
        >
          <ImageSizeIcon className="w-6 h-6" />
        </Button>

        <Button
          active={editorMode === "export"}
          className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center border border-gray-700"
          id="toolbar-export"
          onClick={() => {
            app.editor.setEditorMode("export");
          }}
        >
          <ExportIcon className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
};
