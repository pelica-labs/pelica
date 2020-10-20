import React from "react";

import {
  ExportIcon,
  HandIcon,
  ImageSizeIcon,
  MousePointerIcon,
  PencilIcon,
  PinIcon,
  RouteIcon,
  StyleIcon,
} from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { MenuButton } from "~/components/MenuButton";
import { useApp, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";

export const Toolbar: React.FC = () => {
  const app = useApp();
  const editorMode = useStore((store) => store.editor.mode);
  const screenDimensions = useStore((store) => store.screen.dimensions);

  const SelectHotkey = useHotkey({ key: "1", meta: true }, () => {
    app.editor.setEditorMode("select");
  });
  const MoveHotkey = useHotkey({ key: "2", meta: true }, () => {
    app.editor.setEditorMode("move");
  });
  const DrawHotkey = useHotkey({ key: "3", meta: true }, () => {
    app.editor.setEditorMode("draw");
  });
  const ItineraryHotkey = useHotkey({ key: "4", meta: true }, () => {
    app.editor.setEditorMode("itinerary");
  });
  const PinHotkey = useHotkey({ key: "5", meta: true }, () => {
    app.editor.setEditorMode("pin");
  });

  const tooltipPlacement = screenDimensions.md ? "left" : "above";

  return (
    <>
      <div className="flex md:flex-col md:space-y-1">
        <IconButton
          active={editorMode === "style"}
          className="bg-white text-gray-800 py-2 flex-1 justify-center"
          id="toolbar-style"
          tooltip={{
            placement: tooltipPlacement,
            text: "Styles",
          }}
          onClick={() => {
            app.editor.setEditorMode("style");
          }}
        >
          <StyleIcon className="w-6 h-6" />
        </IconButton>
      </div>

      <div className="flex md:flex-col md:space-y-1 md:mt-6">
        <IconButton
          active={editorMode === "select"}
          id="toolbar-select"
          tooltip={{
            placement: tooltipPlacement,
            text: (
              <div className="flex items-center">
                <span className="mr-4 leading-none">Select</span>
                <SelectHotkey />
              </div>
            ),
          }}
          onClick={() => {
            app.editor.setEditorMode("select");
          }}
        >
          <MousePointerIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "move"}
          id="toolbar-move"
          tooltip={{
            placement: tooltipPlacement,
            text: (
              <div className="flex items-center">
                <span className="mr-4 leading-none">Move</span>
                <MoveHotkey />
              </div>
            ),
          }}
          onClick={() => {
            app.editor.setEditorMode("move");
          }}
        >
          <HandIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "draw"}
          id="toolbar-draw"
          tooltip={{
            placement: tooltipPlacement,
            text: (
              <div className="flex items-center">
                <span className="mr-4 leading-none">Draw</span>
                <DrawHotkey />
              </div>
            ),
          }}
          onClick={() => {
            app.editor.setEditorMode("draw");
          }}
        >
          <PencilIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "itinerary"}
          id="toolbar-itinerary"
          tooltip={{
            placement: tooltipPlacement,
            text: (
              <div className="flex items-center">
                <span className="mr-4 leading-none">Itinerary</span>
                <ItineraryHotkey />
              </div>
            ),
          }}
          onClick={() => {
            app.editor.setEditorMode("itinerary");
          }}
        >
          <RouteIcon className="w-6 h-6" />
        </IconButton>

        <IconButton
          active={editorMode === "pin"}
          id="toolbar-pin"
          tooltip={{
            placement: tooltipPlacement,
            text: (
              <div className="flex items-center">
                <span className="mr-4 leading-none">Pin</span>
                <PinHotkey />
              </div>
            ),
          }}
          onClick={() => {
            app.editor.setEditorMode("pin");
          }}
        >
          <PinIcon className="w-6 h-6" />
        </IconButton>
      </div>

      <div className="flex md:flex-col md:space-y-1 md:mt-6">
        <IconButton
          active={editorMode === "export"}
          id="toolbar-export"
          tooltip={{
            placement: tooltipPlacement,
            text: "Export",
          }}
          onClick={() => {
            app.editor.setEditorMode("export");
          }}
        >
          <ExportIcon className="w-6 h-6" />
        </IconButton>
      </div>

      <div className="flex md:flex-col md:space-y-1 md:mt-6">
        <MenuButton />
      </div>
    </>
  );
};
