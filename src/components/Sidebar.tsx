import * as KeyCode from "keycode-js";
import React, { useEffect, useRef } from "react";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { EraserIcon, TrashIcon, UndoIcon } from "~/components/Icon";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { StyleSelector } from "~/components/StyleSelector";
import { WidthSlider } from "~/components/WidthSlider";
import { aspectRatios } from "~/lib/aspectRatio";
import { useStore } from "~/lib/state";
import { theme } from "~/styles/tailwind";

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
  const fileInput = useRef<HTMLInputElement>(null);
  const ratioSelector = useRef<HTMLSpanElement>(null);
  const style = useStore((store) => store.style);
  const editor = useStore((store) => store.editor);
  const aspectRatio = useStore((store) => store.aspectRatio);
  const actions = useStore((store) => store.actions);
  const dispatch = useStore((store) => store.dispatch);
  const screenWidth = useStore((store) => store.screen.width);
  const selectedGeometry = useStore((store) => store.selectedGeometry);

  const displaySelectionHeader = selectedGeometry !== null && editor.mode === "move";
  const displayColorPicker = ["draw", "pin"].includes(editor.mode) || selectedGeometry;
  const displayWidthPicker = ["draw", "pin"].includes(editor.mode) || selectedGeometry;
  const displaySmartMatching = ["draw"].includes(editor.mode) || selectedGeometry?.type === "PolyLine";

  const boundColor = selectedGeometry ? selectedGeometry.style.strokeColor : editor.strokeColor;
  const boundWidth = selectedGeometry ? selectedGeometry.style.strokeWidth : editor.strokeWidth;
  const boundSmartMatching =
    selectedGeometry?.type === "PolyLine" ? selectedGeometry.smartMatching : editor.smartMatching;

  /**
   * Handle shortcuts
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.keyCode === KeyCode.KEY_Z) {
        event.preventDefault();
        dispatch.undo();
      }

      if (event.metaKey && event.keyCode === KeyCode.KEY_1) {
        event.preventDefault();
        dispatch.setEditorMode("move");
      }

      if (event.metaKey && event.keyCode === KeyCode.KEY_2) {
        event.preventDefault();
        dispatch.setEditorMode("draw");
      }

      if (event.metaKey && event.keyCode === KeyCode.KEY_3) {
        event.preventDefault();
        dispatch.setEditorMode("pin");
      }
    };

    window.addEventListener("keydown", onKeyDown, false);

    return () => {
      window.removeEventListener("keydown", onKeyDown, false);
    };
  });

  return (
    <div className="flex-grow relative flex items-end">
      {editor.pane === "styles" && (
        <div
          className="fixed right-0 overflow-y-auto rounded bg-transparent m-1 z-10"
          style={{
            maxHeight: "calc(100vh - 1rem)",
            right: computePanelOffset(screenWidth),
          }}
        >
          <StyleSelector
            value={style}
            onChange={(style) => {
              dispatch.setStyle(style);
            }}
          />
        </div>
      )}

      {editor.pane === "aspectRatio" && (
        <div
          className="fixed right-0 overflow-y-auto rounded bg-transparent m-1 z-10"
          style={{
            maxHeight: "calc(100vh - 1rem)",
            bottom: 0,
            right: computePanelOffset(screenWidth),
          }}
        >
          <AspectRatioSelector
            value={aspectRatio}
            onChange={(aspectRatio) => {
              dispatch.closePanes();
              dispatch.setAspectRatio(aspectRatio);
            }}
          />
        </div>
      )}

      <div className="flex flex-col justify-between bg-gray-900 text-gray-200 w-32 md:w-48 lg:w-64 h-full pb-1">
        <div>
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-800">
            <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">Design</span>
            <div className="flex ml-2">
              <Button
                className="bg-gray-900 text-gray-200"
                disabled={!actions.length}
                onClick={() => {
                  dispatch.undo();
                }}
              >
                <UndoIcon className="w-2 h-2 md:w-3 md:h-3" />
              </Button>
              <Button
                className="bg-gray-900 text-gray-200 ml-2"
                onClick={() => {
                  dispatch.clear();
                }}
              >
                <EraserIcon className="w-2 h-2 md:w-3 md:h-3" />
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
              active={editor.mode === "draw"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                dispatch.setEditorMode("draw");
              }}
            >
              <span className="text-xs">Draw</span>
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

          {displaySelectionHeader && (
            <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-800 border-gray-700">
              <span className="text-xs uppercase font-light tracking-wide leading-none">
                <span className="text-gray-500">Selection:</span>
                <span className="ml-2">
                  {selectedGeometry?.type} #{selectedGeometry?.id}
                </span>
              </span>
              <Button
                className="bg-gray-900 text-gray-200"
                onClick={() => {
                  dispatch.deleteSelectedGeometry();
                }}
              >
                <TrashIcon className="w-2 h-2 md:w-3 md:h-3" />
              </Button>
            </div>
          )}

          {displayColorPicker && (
            <div className="mt-4 px-2 pb-2 mb-2 border-b border-gray-700">
              <div className="flex items-center px-1">
                <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Color</span>
                <div
                  className="ml-2 w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: boundColor }}
                />
              </div>
              <div className="mt-4">
                <ColorPicker
                  value={boundColor}
                  onChange={(color) => {
                    if (selectedGeometry?.type === "PolyLine") {
                      dispatch.updateSelectedLine(color, selectedGeometry.style.strokeWidth);
                    } else if (selectedGeometry?.type === "Point") {
                      dispatch.updateSelectedPin(color, selectedGeometry.style.strokeWidth);
                    } else {
                      dispatch.setStrokeColor(color);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {displayWidthPicker && (
            <div className="mt-4 px-3 pb-3 mb-2 border-b border-gray-700">
              <div className="flex items-center">
                <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
                <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
                  <div className="rounded-full bg-gray-200" style={{ width: boundWidth, height: boundWidth }} />
                </div>
              </div>
              <div className="mt-4 px-1">
                <WidthSlider
                  value={boundWidth}
                  onChange={(width) => {
                    if (selectedGeometry?.type === "PolyLine") {
                      dispatch.updateSelectedLine(selectedGeometry.style.strokeColor, width);
                    } else if (selectedGeometry?.type === "Point") {
                      dispatch.updateSelectedPin(selectedGeometry.style.strokeColor, width);
                    } else {
                      dispatch.setStrokeWidth(width);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {displaySmartMatching && (
            <div className="mt-2 px-3 pb-2 mb-2 border-b border-gray-700">
              <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

              <div className="mt-2">
                <SmartMatchingSelector
                  value={boundSmartMatching}
                  onChange={(value) => {
                    if (selectedGeometry?.type === "PolyLine") {
                      dispatch.updateSelectedLineSmartMatching(value);
                    } else {
                      dispatch.setEditorSmartMatching(value);
                    }
                  }}
                />
              </div>
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
              className="bg-gray-900 text-gray-200 max-w-full"
              onClick={() => {
                dispatch.togglePane("styles");
              }}
            >
              <span className="lg:w-24 text-left text-xs uppercase text-gray-500 font-light tracking-wide leading-none">
                Style
              </span>
              <span className="ml-2 text-xs text-left truncate">{style.name}</span>
            </Button>

            <Button
              active={editor.pane === "aspectRatio"}
              className="bg-gray-900 text-gray-200"
              onClick={() => {
                dispatch.togglePane("aspectRatio");
              }}
            >
              <span className="lg:w-24 text-left text-xs uppercase text-gray-500 font-light tracking-wide leading-none">
                Aspect ratio
              </span>
              <span ref={ratioSelector} className="ml-2 text-xs text-left">
                {aspectRatios[aspectRatio].name}
              </span>
            </Button>
          </div>

          <div className="flex justify-between items-center mt-8 bg-gray-800 py-2 px-3 h-8">
            <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">Share</span>
          </div>

          <div className="px-1 mt-1">
            <div className="px-2 flex justify-between items-center">
              <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Export</span>

              <div className="flex items-center flex-wrap ml-2">
                <Button
                  className="bg-gray-900 text-xs"
                  onClick={() => {
                    dispatch.downloadImage();
                  }}
                >
                  Image
                </Button>

                <span className="text-gray-500 mx-1 text-xs hidden md:block">/</span>

                <Button
                  className="bg-gray-900 text-xs"
                  onClick={() => {
                    dispatch.downloadGpx();
                  }}
                >
                  GPX
                </Button>
              </div>
            </div>

            <div className="px-2 flex justify-between items-center">
              <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Import</span>
              <Button
                className="bg-gray-900 text-gray-200 mt-1"
                onClick={() => {
                  fileInput.current?.click();
                }}
              >
                <input
                  ref={fileInput}
                  className="hidden"
                  type="file"
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      dispatch.importGpx(event.target.files[0]);
                    }
                  }}
                />
                <span className="text-xs">GPX</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
