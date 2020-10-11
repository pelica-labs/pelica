import * as KeyCode from "keycode-js";
import { throttle } from "lodash";
import React, { useEffect, useRef } from "react";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { ExportIcon, HandIcon, icons, PaintIcon, PinIcon, RedoIcon, TrashIcon, UndoIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { StyleSelector } from "~/components/StyleSelector";
import { WidthSlider } from "~/components/WidthSlider";
import { useApp, useStore } from "~/core/app";
import { Point, PolyLine } from "~/core/geometries";
import { useClickOutside } from "~/hooks/useClickOutside";
import { aspectRatios } from "~/lib/aspectRatio";
import { SmartMatching } from "~/lib/smartMatching";
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

const allIcons = icons();

type Props = {
  onImage: (image: string) => void;
};

export const Sidebar: React.FC<Props> = ({ onImage }) => {
  const app = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useStore((store) => store.editor);
  const line = useStore((store) => store.line);
  const pin = useStore((store) => store.pin);
  const actions = useStore((store) => store.history.actions);
  const redoStack = useStore((store) => store.history.redoStack);
  const screenWidth = useStore((store) => store.screen.dimensions.width);
  const geometries = useStore((store) => store.geometries.items);
  const selectedGeometryId = useStore((store) => store.selection.selectedGeometryId);
  const stylePane = useClickOutside<HTMLDivElement>(() => {
    app.editor.closePanes();
  });
  const iconPane = useClickOutside<HTMLDivElement>(() => {
    app.editor.closePanes();
  });

  const selectedGeometry = geometries.find((geometry) => geometry.id === selectedGeometryId) as Point | PolyLine | null;

  const SelectedIcon = allIcons[pin.icon];

  const displaySelectionHeader = selectedGeometry && editor.mode === "move";
  const displayIconPicker = editor.mode === "pin" || selectedGeometry?.type === "Point";
  const displayColorPicker = ["draw", "pin"].includes(editor.mode) || selectedGeometry;
  const displayWidthPicker = ["draw", "pin"].includes(editor.mode) || selectedGeometry;
  const displaySmartMatching = ["draw"].includes(editor.mode) || selectedGeometry?.type === "Line";
  const displayGpxImport = editor.mode === "draw";

  const boundColor = selectedGeometry ? selectedGeometry.style.color : editor.mode === "draw" ? line.color : pin.color;
  const boundWidth = selectedGeometry ? selectedGeometry.style.width : editor.mode === "draw" ? line.width : pin.width;
  const boundSmartMatching = selectedGeometry?.type === "Line" ? selectedGeometry.smartMatching : editor.smartMatching;

  const onIconChange = (icon: string) => {
    if (selectedGeometry?.type === "Point") {
      app.pin.updateSelectedPin(icon, selectedGeometry.style.color, selectedGeometry.style.width);
    } else {
      app.pin.setIcon(icon);
    }
  };

  const onColorChange = throttle((color: string) => {
    if (selectedGeometry?.type === "Line") {
      app.line.transientUpdateSelectedLine(color, selectedGeometry.style.width);
    } else if (selectedGeometry?.type === "Point") {
      app.pin.transientUpdateSelectedPin(selectedGeometry.style.icon, color, selectedGeometry.style.width);
    } else if (editor.mode === "draw") {
      app.line.setColor(color);
    } else if (editor.mode === "pin") {
      app.pin.setColor(color);
    }
  }, 200);

  const onColorChangeComplete = (color: string) => {
    if (selectedGeometry?.type === "Line") {
      app.line.updateSelectedLine(color, selectedGeometry.style.width);
    } else if (selectedGeometry?.type === "Point") {
      app.pin.updateSelectedPin(selectedGeometry.style.icon, color, selectedGeometry.style.width);
    }
  };

  const onWidthChange = (width: number) => {
    if (selectedGeometry?.type === "Line") {
      app.line.transientUpdateSelectedLine(selectedGeometry.style.color, width);
    } else if (selectedGeometry?.type === "Point") {
      app.pin.transientUpdateSelectedPin(selectedGeometry.style.icon, selectedGeometry.style.color, width);
    } else if (editor.mode === "draw") {
      app.line.setWidth(width);
    } else if (editor.mode === "pin") {
      app.pin.setWidth(width);
    }
  };

  const onWidthChangeComplete = (width: number) => {
    if (selectedGeometry?.type === "Line") {
      app.line.updateSelectedLine(selectedGeometry.style.color, width);
    } else if (selectedGeometry?.type === "Point") {
      app.pin.updateSelectedPin(selectedGeometry.style.icon, selectedGeometry.style.color, width);
    }
  };

  const onSmartMatchingChange = (smartMatching: SmartMatching) => {
    if (selectedGeometry?.type === "Line") {
      app.line.updateSelectedLineSmartMatching(smartMatching);
    } else {
      app.editor.setEditorSmartMatching(smartMatching);
    }
  };

  /**
   * Handle shortcuts
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.keyCode === KeyCode.KEY_Z) {
        event.preventDefault();

        if (event.shiftKey) {
          app.history.redo();
        } else {
          app.history.undo();
        }
      }

      if (event.metaKey && event.keyCode === KeyCode.KEY_1) {
        event.preventDefault();
        app.editor.setEditorMode("move");
      }

      if (event.metaKey && event.keyCode === KeyCode.KEY_2) {
        event.preventDefault();
        app.editor.setEditorMode("draw");
      }

      if (event.metaKey && event.keyCode === KeyCode.KEY_3) {
        event.preventDefault();
        app.editor.setEditorMode("pin");
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
          ref={stylePane}
          className="fixed right-0 overflow-y-auto rounded bg-transparent m-1 z-10"
          style={{
            maxHeight: "calc(100vh - 1rem)",
            right: computePanelOffset(screenWidth),
          }}
        >
          <StyleSelector
            value={editor.style}
            onChange={(style) => {
              app.editor.setStyle(style);
            }}
          />
        </div>
      )}

      {editor.pane === "icons" && (
        <div
          ref={iconPane}
          className="fixed right-0 overflow-y-auto rounded bg-transparent m-1 z-10"
          style={{
            maxHeight: "calc(100vh - 1rem)",
            top: 100,
            right: computePanelOffset(screenWidth),
          }}
        >
          <IconSelector
            value={pin.icon}
            onChange={(icon) => {
              onIconChange(icon);
              app.editor.closePanes();
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
            value={editor.aspectRatio}
            onChange={(aspectRatio) => {
              app.editor.closePanes();
              app.editor.setAspectRatio(aspectRatio);
            }}
          />
        </div>
      )}

      <div className="flex flex-col justify-between bg-gray-900 text-gray-200 w-32 md:w-48 lg:w-64 h-full">
        <div>
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-800">
            <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">Design</span>
            <div className="flex ml-2">
              <Button
                className="bg-gray-900 text-gray-200"
                disabled={!actions.length}
                onClick={() => {
                  app.history.undo();
                }}
              >
                <UndoIcon className="w-2 h-2 md:w-3 md:h-3" />
              </Button>
              <Button
                className="bg-gray-900 text-gray-200 ml-2"
                disabled={!redoStack.length}
                onClick={() => {
                  app.history.redo();
                }}
              >
                <RedoIcon className="w-2 h-2 md:w-3 md:h-3" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap border-t border-b border-gray-700">
            <Button
              active={editor.mode === "move"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                app.editor.setEditorMode("move");
              }}
            >
              <HandIcon className="w-6 h-6" />
            </Button>

            <Button
              active={editor.mode === "draw"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                app.editor.setEditorMode("draw");
              }}
            >
              <PaintIcon className="w-6 h-6" />
            </Button>

            <Button
              active={editor.mode === "pin"}
              className="bg-gray-900 text-gray-200 py-2 flex-1 justify-center"
              rounded={false}
              onClick={() => {
                app.editor.setEditorMode("pin");
              }}
            >
              <PinIcon className="w-6 h-6" />
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
                  app.selection.deleteSelectedGeometry();
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
                    onColorChange(color);
                  }}
                  onChangeComplete={(color) => {
                    onColorChangeComplete(color);
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
                  max={12}
                  min={1}
                  value={boundWidth}
                  onChange={(width) => {
                    onWidthChange(width);
                  }}
                  onChangeComplete={(width) => {
                    onWidthChangeComplete(width);
                  }}
                />
              </div>
            </div>
          )}

          {displayIconPicker && (
            <div className="mt-2 px-3 pb-2 mb-2 border-b border-gray-700">
              <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Icon</span>

              <Button
                className="mt-2"
                onClick={() => {
                  app.editor.togglePane("icons");
                }}
              >
                <div className="flex items-start">
                  <SelectedIcon className="w-4 h-4" />
                  <span className="ml-2 text-gray-500 text-xs">{pin.icon}</span>
                </div>
              </Button>
            </div>
          )}

          {displaySmartMatching && (
            <div className="mt-2 px-3 pb-2 mb-2 border-b border-gray-700">
              <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

              <div className="mt-2">
                <SmartMatchingSelector
                  value={boundSmartMatching}
                  onChange={(smartMatching) => {
                    onSmartMatchingChange(smartMatching);
                  }}
                />
              </div>
            </div>
          )}

          {displayGpxImport && (
            <div className="px-3 flex justify-between items-center">
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
                      app.import.importGpx(event.target.files[0]);
                    }
                  }}
                />
                <span className="text-xs">GPX</span>
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
              className="bg-gray-900 text-gray-200 max-w-full"
              onClick={() => {
                app.editor.togglePane("styles");
              }}
            >
              <span className="lg:w-24 text-left text-xs uppercase text-gray-500 font-light tracking-wide leading-none">
                Style
              </span>
              <span className="ml-2 text-xs text-left truncate">{editor.style.name}</span>
            </Button>

            <Button
              active={editor.pane === "aspectRatio"}
              className="bg-gray-900 text-gray-200"
              onClick={() => {
                app.editor.togglePane("aspectRatio");
              }}
            >
              <span className="lg:w-24 text-left text-xs uppercase text-gray-500 font-light tracking-wide leading-none">
                Aspect ratio
              </span>
              <span className="ml-2 text-xs text-left">{aspectRatios[editor.aspectRatio].name}</span>
            </Button>
          </div>

          <div className="flex justify-end items-center mt-8 bg-gray-800 py-2 px-3">
            <Button
              className="bg-green-700 border border-green-500 hover:border-green-800 text-xs uppercase py-2"
              onClick={() => {
                const image = app.export.generateImage();

                onImage(image);
              }}
            >
              Export
              <ExportIcon className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
