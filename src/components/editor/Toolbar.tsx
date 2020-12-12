import React from "react";

import { ButtonLabel } from "~/components/ui/ButtonLabel";
import {
  FilmIcon,
  HandIcon,
  MountainIcon,
  MousePointerIcon,
  PencilIcon,
  PinIcon,
  RouteIcon,
  StyleIcon,
  TextIcon,
} from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";
import { app, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";
import { useLayout } from "~/hooks/useLayout";

export const Toolbar: React.FC = () => {
  const editorMode = useStore((store) => store.editor.mode);
  const layout = useLayout();

  const MoveHotkey = useHotkey({ key: "m" }, () => {
    app.editor.setEditorMode("move");
  });
  const SelectHotkey = useHotkey({ key: "s" }, () => {
    app.editor.setEditorMode("select");
  });
  const RouteHotkey = useHotkey({ key: "l" }, () => {
    app.editor.setEditorMode("route");
  });
  const ItineraryHotkey = useHotkey({ key: "r" }, () => {
    app.editor.setEditorMode("itinerary");
  });
  const PinHotkey = useHotkey({ key: "p" }, () => {
    app.editor.setEditorMode("pin");
  });
  const TextHotkey = useHotkey({ key: "t" }, () => {
    app.editor.setEditorMode("text");
  });
  const StyleHotkey = useHotkey({ key: "y" }, () => {
    app.editor.setEditorMode("style");
  });
  const ThreeDHotkey = useHotkey({ key: "d" }, () => {
    app.editor.setEditorMode("3d");
  });
  const ScenesHotkey = useHotkey({ key: "c" }, () => {
    app.editor.setEditorMode("scenes");
  });

  const tooltipPlacement = layout.horizontal ? "left" : "above";

  return (
    <div className="flex md:flex-col md:space-y-1 p-1">
      <IconButton
        active={editorMode === "move"}
        className="flex flex-col w-full group"
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
        <HandIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" label="Move" />
      </IconButton>

      <IconButton
        active={editorMode === "select"}
        className="flex flex-col w-full group"
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
        <MousePointerIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" label="Select" />
      </IconButton>

      {/* spacer */}
      <div className="h-6" />

      <IconButton
        active={editorMode === "route"}
        className="flex flex-col w-full group"
        id="toolbar-draw"
        tooltip={{
          placement: tooltipPlacement,
          text: (
            <div className="flex items-center">
              <span className="mr-4 leading-none">Draw</span>
              <RouteHotkey />
            </div>
          ),
        }}
        onClick={() => {
          app.editor.setEditorMode("route");
        }}
      >
        <PencilIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" label="Line" />
      </IconButton>

      <IconButton
        active={editorMode === "itinerary"}
        className="flex flex-col w-full group"
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
        <RouteIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" label="Route" />
      </IconButton>

      <IconButton
        active={editorMode === "pin"}
        className="flex flex-col w-full group"
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
        <PinIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" label="Pin" />
      </IconButton>

      <IconButton
        active={editorMode === "text"}
        className="flex flex-col w-full group"
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
        <TextIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" label="Text" />
      </IconButton>

      {/* spacer */}
      <div className="h-6" />

      <IconButton
        active={editorMode === "style"}
        className="flex flex-col w-full group"
        id="toolbar-style"
        tooltip={{
          placement: tooltipPlacement,
          text: (
            <div className="flex items-center">
              <span className="mr-4 leading-none">Style</span>
              <StyleHotkey />
            </div>
          ),
        }}
        onClick={() => {
          app.editor.setEditorMode("style");
        }}
      >
        <StyleIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" hotkey="y" label="Style" />
      </IconButton>

      <IconButton
        active={editorMode === "3d"}
        className="flex flex-col w-full group"
        id="toolbar-3d"
        tooltip={{
          placement: tooltipPlacement,
          text: (
            <div className="flex items-center">
              <span className="mr-4 leading-none">3D</span>
              <ThreeDHotkey />
            </div>
          ),
        }}
        onClick={() => {
          app.editor.setEditorMode("3d");
        }}
      >
        <MountainIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" hotkey="d" label="3D" />
      </IconButton>

      <IconButton
        active={editorMode === "scenes"}
        className="flex flex-col w-full group"
        id="toolbar-scenes"
        tooltip={{
          placement: tooltipPlacement,
          text: (
            <div className="flex items-center">
              <span className="mr-4 leading-none">Scenes</span>
              <ScenesHotkey />
            </div>
          ),
        }}
        onClick={() => {
          app.editor.setEditorMode("scenes");
        }}
      >
        <FilmIcon className="w-8 h-8 md:w-6 md:h-6" />
        <ButtonLabel className="text-2xs hidden md:inline-block" hotkey="c" label="Scenes" />
      </IconButton>
    </div>
  );
};
