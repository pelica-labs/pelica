import React, { useRef } from "react";

import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import {
  CheckboxIcon,
  DownloadIcon,
  EmptyCheckboxIcon,
  EraserIcon,
  FireIcon,
  ShareIcon,
  UndoIcon,
  UploadIcon,
} from "~/components/Icon";
import { StyleSelector } from "~/components/StyleSelector";
import { WidthSlider } from "~/components/WidthSlider";
import { useStore } from "~/lib/state";
import { theme } from "~/lib/tailwind";

const computePanelOffset = (screenWidth: number) => {
  if (screenWidth <= parseInt(theme.screens.md)) {
    return theme.width[32];
  }

  if (screenWidth <= parseInt(theme.screens.lg)) {
    return theme.width[48];
  }

  return theme.width[64];
};

export const Sidebar: React.FC = () => {
  const ref = useRef<HTMLInputElement>(null);
  const style = useStore((store) => store.style);
  const editor = useStore((store) => store.editor);
  const actions = useStore((store) => store.actions);
  const dispatch = useStore((store) => store.dispatch);
  const screenWidth = useStore((store) => store.screen.width);

  const displayColorPicker = ["brush", "trace", "pin"].includes(editor.mode);
  const displayWidthPicker = ["brush", "trace", "pin"].includes(editor.mode);
  const displaySmartMatching = ["brush", "trace"].includes(editor.mode);

  return (
    <div className="relative flex items-end">
      {editor.pane === "styles" && (
        <div
          className="fixed right-0 overflow-y-auto rounded bg-transparent m-1"
          style={{ maxHeight: "calc(100vh - 1rem)", right: computePanelOffset(screenWidth) }}
        >
          <StyleSelector />
        </div>
      )}

      <div className="flex flex-col justify-between bg-gray-900 text-gray-200 w-32 md:w-48 lg:w-64 h-full pb-1">
        <div>
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-800">
            <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">Design</span>
            <div className="flex">
              <Button
                className="bg-gray-900 text-gray-200"
                disabled={!actions.length}
                onClick={() => {
                  dispatch.undo();
                }}
              >
                <UndoIcon className="w-3 h-3" />
              </Button>
              <Button
                className="bg-gray-900 text-gray-200 ml-2"
                onClick={() => {
                  dispatch.clear();
                }}
              >
                <EraserIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap border-t border-b border-gray-700">
            <Button
              active={editor.mode === "move"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                dispatch.setEditorMode("move");
              }}
            >
              <span className="text-xs">Move</span>
            </Button>

            <Button
              active={editor.mode === "brush"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                dispatch.setEditorMode("brush");
              }}
            >
              <span className="text-xs">Brush</span>
            </Button>

            <Button
              active={editor.mode === "trace"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                dispatch.setEditorMode("trace");
              }}
            >
              <span className="text-xs">Trace</span>
            </Button>

            <Button
              active={editor.mode === "pin"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                dispatch.setEditorMode("pin");
              }}
            >
              <span className="text-xs">Pin</span>
            </Button>
          </div>

          {displayColorPicker && (
            <div className="mt-4 px-2 pb-2 mb-2 border-b border-gray-700">
              <div className="flex items-center px-1">
                <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Color</span>
                <div
                  className="ml-2 w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: editor.strokeColor }}
                />
              </div>
              <div className="mt-4">
                <ColorPicker />
              </div>
            </div>
          )}

          {displayWidthPicker && (
            <div className="mt-4 px-3 pb-3 mb-2 border-b border-gray-700">
              <div className="flex items-center">
                <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
                <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
                  <div
                    className="rounded-full bg-gray-200"
                    style={{ width: editor.strokeWidth, height: editor.strokeWidth }}
                  />
                </div>
              </div>
              <div className="mt-4 px-1">
                <WidthSlider />
              </div>
            </div>
          )}

          {displaySmartMatching && (
            <div className="mt-2 px-3 pb-2 mb-2 border-b border-gray-700">
              <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

              <Button
                className="bg-gray-900 text-gray-200 mt-2"
                onClick={() => {
                  dispatch.toggleSmartMatching();
                }}
              >
                {editor.smartMatching ? (
                  <CheckboxIcon className="w-3 h-3" />
                ) : (
                  <EmptyCheckboxIcon className="w-3 h-3" />
                )}
                <span className="ml-2 text-xs">Smart matching</span>
              </Button>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center px-3 py-2 h-8 bg-gray-800">
            <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">Map</span>
          </div>
          <div className="mt-1 px-1">
            <Button
              active={editor.pane === "styles"}
              className="bg-gray-900 text-gray-200"
              onClick={() => {
                dispatch.togglePane("styles");
              }}
            >
              <FireIcon className="w-3 h-3" />
              <span className="ml-2 text-xs text-left">
                Style<span className="text-gray-500">:</span> {style.owner} <span className="text-gray-500">/</span>{" "}
                {style.name}
              </span>
            </Button>
          </div>

          <div className="flex justify-between items-center mt-8 bg-gray-800 py-2 px-3 h-8">
            <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">Share</span>
          </div>

          <div className="px-1">
            <Button
              className="bg-gray-900 text-gray-200 mt-1"
              onClick={() => {
                dispatch.downloadImage();
              }}
            >
              <ShareIcon className="w-3 h-3" />
              <span className="ml-2 text-xs">Download</span>
            </Button>

            <Button
              className="bg-gray-900 text-gray-200 mt-1"
              onClick={() => {
                ref.current?.click();
              }}
            >
              <UploadIcon className="w-3 h-3" />
              <input
                ref={ref}
                className="hidden"
                type="file"
                onChange={(event) => {
                  if (event.target.files?.length) {
                    dispatch.importGpx(event.target.files[0]);
                  }
                }}
              />
              <span className="ml-2 text-xs">Upload GPX</span>
            </Button>

            <Button
              className="bg-gray-900 text-gray-200 mt-1"
              disabled={!actions.length}
              onClick={() => {
                dispatch.downloadGpx();
              }}
            >
              <DownloadIcon className="w-3 h-3" />
              <span className="ml-2 text-xs">Download GPX</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
