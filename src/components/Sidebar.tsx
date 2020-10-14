import { throttle } from "lodash";
import React, { useRef } from "react";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { TrashIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { ItineraryInput } from "~/components/ItineraryInput";
import { MenuButton } from "~/components/MenuButton";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { StyleSelector } from "~/components/StyleSelector";
import { Toolbar } from "~/components/Toolbar";
import { WidthSlider } from "~/components/WidthSlider";
import { useApp, useStore, useStoreSubscription } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";
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

type Props = {
  onImage: (image: string) => void;
};

export const Sidebar: React.FC<Props> = ({ onImage }) => {
  const app = useApp();
  const itineraryContainer = useRef<HTMLDivElement>(null);
  const editor = useStore((store) => store.editor);
  const screenWidth = useStore((store) => store.screen.dimensions.width);
  const currentItinerary = useStore((store) => store.itineraries.currentItinerary);

  /**
   * Focus itinerary input when switching to mode
   */
  useStoreSubscription(
    (store) => store.editor.mode === "itinerary",
    (itineraryMode) => {
      if (itineraryMode) {
        setTimeout(() => {
          itineraryContainer.current?.querySelector("input")?.focus();
        });
      }
    }
  );

  useHotkey({ key: "1", meta: true }, () => {
    app.editor.setEditorMode("move");
  });

  useHotkey({ key: "2", meta: true }, () => {
    app.editor.setEditorMode("draw");
  });

  useHotkey({ key: "3", meta: true }, () => {
    app.editor.setEditorMode("itinerary");
  });

  useHotkey({ key: "4", meta: true }, () => {
    app.editor.setEditorMode("pin");
  });

  return (
    <div className="flex-grow relative flex items-end">
      <div
        className="fixed top-0 flex flex-col bg-gray-800 m-2 p-1 shadow rounded"
        style={{ right: computePanelOffset(screenWidth) }}
      >
        <Toolbar onImage={onImage} />
      </div>

      {editor.mode === "itinerary" && (
        <div
          ref={itineraryContainer}
          className="fixed top-0 mt-2"
          style={{ right: computePanelOffset(screenWidth), marginRight: 64 }}
        >
          <ItineraryInput
            value={currentItinerary}
            onChange={(places) => {
              app.itineraries.updateCurrentItinerary(places);
            }}
          />
        </div>
      )}

      <div className="flex flex-col bg-gray-900 text-gray-200 w-32 md:w-48 lg:w-64 h-full overflow-y-auto">
        <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-800">
          <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">{editor.mode}</span>
          <MenuButton />
        </div>

        {editor.mode === "style" && (
          <StyleSelector
            value={editor.style}
            onChange={(style) => {
              app.editor.setStyle(style);
            }}
          />
        )}

        {editor.mode === "move" && <MoveSidebar />}

        {editor.mode === "pin" && <PinSidebar />}

        {editor.mode === "draw" && <DrawSidebar />}

        {editor.mode === "itinerary" && <ItinerarySidebar />}

        {editor.mode === "aspectRatio" && (
          <AspectRatioSelector
            value={editor.aspectRatio}
            onChange={(aspectRatio) => {
              app.editor.setAspectRatio(aspectRatio);
            }}
          />
        )}
      </div>
    </div>
  );
};

const MoveSidebar: React.FC = () => {
  const app = useApp();
  const selectedGeometryId = useStore((store) => store.selection.selectedGeometryId);
  const selectedGeometry = useStore((store) => store.geometries.items).find(
    (geometry) => geometry.id === selectedGeometryId
  );

  if (!selectedGeometry) {
    return null;
  }

  if (selectedGeometry.type !== "Point" && selectedGeometry.type !== "Line") {
    return null;
  }

  const onColorChange = throttle((color: string) => {
    if (selectedGeometry.type === "Line") {
      app.line.transientUpdateSelectedLine(color, selectedGeometry.style.width);
    } else if (selectedGeometry.type === "Point") {
      app.pin.transientUpdateSelectedPin(selectedGeometry.style.icon, color, selectedGeometry.style.width);
    }
  }, 200);

  const onColorChangeComplete = (color: string) => {
    if (selectedGeometry.type === "Line") {
      app.line.updateSelectedLine(color, selectedGeometry.style.width);
    } else if (selectedGeometry.type === "Point") {
      app.pin.updateSelectedPin(selectedGeometry.style.icon, color, selectedGeometry.style.width);
    }
  };

  const onWidthChange = (width: number) => {
    if (selectedGeometry.type === "Line") {
      app.line.transientUpdateSelectedLine(selectedGeometry.style.color, width);
    } else if (selectedGeometry.type === "Point") {
      app.pin.transientUpdateSelectedPin(selectedGeometry.style.icon, selectedGeometry.style.color, width);
    }
  };

  const onWidthChangeComplete = (width: number) => {
    if (selectedGeometry.type === "Line") {
      app.line.updateSelectedLine(selectedGeometry.style.color, width);
    } else if (selectedGeometry.type === "Point") {
      app.pin.updateSelectedPin(selectedGeometry.style.icon, selectedGeometry.style.color, width);
    }
  };

  const onSmartMatchingChange = (smartMatching: SmartMatching) => {
    app.line.updateSelectedLineSmartMatching(smartMatching);
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-t bg-gray-800 border-gray-700">
        <span className="text-xs uppercase font-light tracking-wide leading-none">
          <span className="text-gray-500">Selection:</span>
          <span className="ml-2">{selectedGeometry?.type}</span>
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

      <div className="mt-4 px-2 pb-2 mb-2 border-b border-gray-700">
        <div className="flex items-center px-1">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Color</span>
          <div
            className="ml-2 w-3 h-3 rounded-full border border-gray-200"
            style={{ backgroundColor: selectedGeometry.style.color }}
          />
        </div>
        <div className="mt-4">
          <ColorPicker
            value={selectedGeometry.style.color}
            onChange={(color) => {
              onColorChange(color);
            }}
            onChangeComplete={(color) => {
              onColorChangeComplete(color);
            }}
          />
        </div>
      </div>

      <div className="mt-4 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div
              className="rounded-full bg-gray-200"
              style={{ width: selectedGeometry.style.width, height: selectedGeometry.style.width }}
            />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            max={12}
            min={1}
            value={selectedGeometry.style.width}
            onChange={(width) => {
              onWidthChange(width);
            }}
            onChangeComplete={(width) => {
              onWidthChangeComplete(width);
            }}
          />
        </div>
      </div>

      {selectedGeometry.type === "Point" && (
        <div className="mt-2 px-3 pb-2 mb-2 border-b border-gray-700">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Icon</span>

          <div className="mt-2">
            <IconSelector
              value={selectedGeometry.style.icon}
              onChange={(icon) => {
                app.pin.updateSelectedPin(icon, selectedGeometry.style.color, selectedGeometry.style.width);
              }}
            />
          </div>
        </div>
      )}

      {selectedGeometry.type === "Line" && (
        <div className="mt-2 px-3 pb-2 mb-2 border-b border-gray-700">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

          <div className="mt-2">
            <SmartMatchingSelector
              value={selectedGeometry.smartMatching}
              onChange={(smartMatching) => {
                onSmartMatchingChange(smartMatching);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const PinSidebar: React.FC = () => {
  const app = useApp();
  const color = useStore((store) => store.pin.color);
  const width = useStore((store) => store.pin.width);
  const icon = useStore((store) => store.pin.icon);

  return (
    <>
      <div className="mt-4 px-2 pb-2 mb-2 border-b border-gray-700">
        <div className="flex items-center px-1">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Color</span>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
        </div>
        <div className="mt-4">
          <ColorPicker
            value={color}
            onChange={(color) => {
              app.pin.setColor(color);
            }}
            onChangeComplete={(color) => {
              app.pin.setColor(color);
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full bg-gray-200" style={{ width: width, height: width }} />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            max={12}
            min={1}
            value={width}
            onChange={(width) => {
              app.pin.setWidth(width);
            }}
            onChangeComplete={(width) => {
              app.pin.setWidth(width);
            }}
          />
        </div>
      </div>

      <div className="px-3 pb-2 mb-2 border-b border-gray-700">
        <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Icon</span>

        <div className="mt-2">
          <IconSelector
            value={icon}
            onChange={(icon) => {
              app.pin.setIcon(icon);
            }}
          />
        </div>
      </div>
    </>
  );
};

const DrawSidebar: React.FC = () => {
  const app = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const color = useStore((store) => store.line.color);
  const width = useStore((store) => store.line.width);
  const smartMatching = useStore((store) => store.editor.smartMatching);

  return (
    <>
      <div className="mt-4 px-2 pb-2 mb-2 border-b border-gray-700">
        <div className="flex items-center px-1">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Color</span>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
        </div>
        <div className="mt-4">
          <ColorPicker
            value={color}
            onChange={(color) => {
              app.line.setColor(color);
            }}
            onChangeComplete={(color) => {
              app.line.setColor(color);
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full bg-gray-200" style={{ width: width, height: width }} />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            max={12}
            min={1}
            value={width}
            onChange={(width) => {
              app.line.setWidth(width);
            }}
            onChangeComplete={(width) => {
              app.line.setWidth(width);
            }}
          />
        </div>
      </div>

      <div className="px-3 pb-2 mb-2 border-b border-gray-700">
        <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

        <div className="mt-2">
          <SmartMatchingSelector
            value={smartMatching}
            onChange={(smartMatching) => {
              app.editor.setEditorSmartMatching(smartMatching);
            }}
          />
        </div>
      </div>

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
    </>
  );
};

const ItinerarySidebar: React.FC = () => {
  const app = useApp();
  const color = useStore((store) => store.line.color);
  const width = useStore((store) => store.line.width);
  const smartMatching = useStore((store) => store.editor.smartMatching);

  return (
    <>
      <div className="mt-4 px-2 pb-2 mb-2 border-b border-gray-700">
        <div className="flex items-center px-1">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Color</span>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
        </div>
        <div className="mt-4">
          <ColorPicker
            value={color}
            onChange={(color) => {
              app.line.setColor(color);
            }}
            onChangeComplete={(color) => {
              app.line.setColor(color);
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full bg-gray-200" style={{ width: width, height: width }} />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            max={12}
            min={1}
            value={width}
            onChange={(width) => {
              app.line.setWidth(width);
            }}
            onChangeComplete={(width) => {
              app.line.setWidth(width);
            }}
          />
        </div>
      </div>

      <div className="px-3 pb-2 mb-2 border-b border-gray-700">
        <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

        <div className="mt-2">
          <SmartMatchingSelector
            value={smartMatching}
            onChange={(smartMatching) => {
              app.editor.setEditorSmartMatching(smartMatching);
            }}
          />
        </div>
      </div>
    </>
  );
};
