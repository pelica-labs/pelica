import React from "react";

import {
  ExportIcon,
  HandIcon,
  MousePointerIcon,
  PencilIcon,
  PinIcon,
  RouteIcon,
  StyleIcon,
  TextIcon,
} from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { MenuButton } from "~/components/MenuButton";
import { UserMenu } from "~/components/UserMenu";
import { app, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";

export const Toolbar: React.FC = () => {
  const editorMode = useStore((store) => store.editor.mode);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

  const MoveHotkey = useHotkey({ key: "1", meta: true }, () => {
    app.editor.setEditorMode("move");
  });
  const SelectHotkey = useHotkey({ key: "2", meta: true }, () => {
    app.editor.setEditorMode("select");
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
  const TextHotkey = useHotkey({ key: "6", meta: true }, () => {
    app.editor.setEditorMode("text");
  });

  const tooltipPlacement = screenDimensions.md ? "left" : "above";

  return (
    <>
      <div className="flex md:flex-col md:space-y-1">
        <IconButton
          active={editorMode === "move"}
          className="ml-1 md:ml-0"
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
          <HandIcon className="w-8 h-8 md:w-7 md:h-7" />
        </IconButton>

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
          <MousePointerIcon className="w-8 h-8 md:w-7 md:h-7" />
        </IconButton>
      </div>

      <div className="flex md:flex-col md:space-y-1 md:mt-6">
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
          <PencilIcon className="w-8 h-8 md:w-7 md:h-7" />
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
          <RouteIcon className="w-8 h-8 md:w-7 md:h-7" />
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
          <PinIcon className="w-8 h-8 md:w-7 md:h-7" />
        </IconButton>

        <IconButton
          active={editorMode === "text"}
          id="toolbar-text"
          tooltip={{
            placement: tooltipPlacement,
            text: (
              <div className="flex items-center">
                <span className="mr-4 leading-none">Text</span>
                <TextHotkey />
              </div>
            ),
          }}
          onClick={() => {
            app.editor.setEditorMode("text");
          }}
        >
          <TextIcon className="w-8 h-8 md:w-7 md:h-7" />
        </IconButton>

        <IconButton
          active={editorMode === "style"}
          id="toolbar-style"
          tooltip={{
            placement: tooltipPlacement,
            text: "Styles",
          }}
          onClick={() => {
            app.editor.setEditorMode("style");
          }}
        >
          <StyleIcon className="w-8 h-8 md:w-7 md:h-7" />
        </IconButton>
      </div>
      {/*
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
          <ExportIcon className="w-8 h-8 md:w-7 md:h-7" />
        </IconButton>

        {!screenDimensions.md && (
          <div className="mx-2 flex items-center space-x-2">
            <MenuButton />
            <UserMenu />
          </div>
        )}
      </div> */}
    </>
  );
};
