import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import BounceLoader from "react-spinners/BounceLoader";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { TrashIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { MenuButton } from "~/components/MenuButton";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { StyleSelector } from "~/components/StyleSelector";
import { Toolbar } from "~/components/Toolbar";
import { WidthSlider } from "~/components/WidthSlider";
import { useApp, useStore } from "~/core/app";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { useDimensions } from "~/hooks/useDimensions";
import { useHotkey } from "~/hooks/useHotkey";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { Style } from "~/lib/style";
import { theme } from "~/styles/tailwind";

type Props = {
  initialStyles: Style[];
};

export const Sidebar: React.FC<Props> = ({ initialStyles }) => {
  const app = useApp();
  const editorMode = useStore((store) => store.editor.mode);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);

  useHotkey({ key: "1", meta: true }, () => {
    app.editor.setEditorMode("select");
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
    <div ref={sidebarRef} className="flex-grow relative flex items-end">
      {sidebarDimensions && (
        <div
          className="fixed top-0 flex flex-col bg-gray-800 m-2 p-1 shadow rounded"
          style={{ right: sidebarDimensions.width }}
        >
          <Toolbar />
        </div>
      )}

      <div className="flex flex-col bg-gray-900 text-gray-200 w-32 md:w-48 lg:w-64 h-full overflow-y-auto">
        <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-800">
          <span className="text-xs uppercase text-gray-300 font-light tracking-wide leading-none">
            <Trans i18nKey={`editor.mode.${editorMode}`} />
          </span>
          <MenuButton />
        </div>

        {editorMode === "style" && <StyleSidebar initialStyles={initialStyles} />}

        {editorMode === "select" && <SelectSidebar />}

        {editorMode === "pin" && <PinSidebar />}

        {editorMode === "draw" && <DrawSidebar />}

        {editorMode === "itinerary" && <ItinerarySidebar />}

        {editorMode === "aspectRatio" && <AspectRatioSidebar />}

        {editorMode === "export" && <ExportSidebar />}
      </div>
    </div>
  );
};

const StyleSidebar: React.FC<Props> = ({ initialStyles }) => {
  const app = useApp();
  const style = useStore((store) => store.editor.style);

  return (
    <StyleSelector
      initialStyles={initialStyles}
      value={style}
      onChange={(style) => {
        app.editor.setStyle(style);
      }}
    />
  );
};

const AspectRatioSidebar: React.FC = () => {
  const app = useApp();
  const aspectRatio = useStore((store) => store.editor.aspectRatio);

  return (
    <AspectRatioSelector
      value={aspectRatio}
      onChange={(aspectRatio) => {
        app.editor.setAspectRatio(aspectRatio);
      }}
    />
  );
};

const SelectSidebar: React.FC = () => {
  const app = useApp();
  const selectedGeometryId = useStore((store) => store.selection.selectedGeometryId);
  const selectedGeometry = useStore((store) => store.geometries.items).find(
    (geometry) => geometry.id === selectedGeometryId
  );

  if (selectedGeometry?.type !== "Point" && selectedGeometry?.type !== "Line") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-t bg-gray-800 border-gray-700">
        <span className="text-xs uppercase font-light tracking-wide leading-none">
          <span className="text-gray-500">Selection:</span>
          <span className="ml-2">{selectedGeometry.type}</span>
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
            style={{ backgroundColor: selectedGeometry.transientStyle?.color ?? selectedGeometry.style.color }}
          />
        </div>
        <div className="mt-4">
          <ColorPicker
            value={selectedGeometry.style.color}
            onChange={(color) => {
              if (selectedGeometry.type === "Line") {
                app.routes.transientUpdateSelectedLine({ color });
              } else if (selectedGeometry.type === "Point") {
                app.pins.transientUpdateSelectedPin({ color });
              }
            }}
            onChangeComplete={(color) => {
              if (selectedGeometry.type === "Line") {
                app.routes.updateSelectedLine({ color });
              } else if (selectedGeometry.type === "Point") {
                app.pins.updateSelectedPin({ color });
              }
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div
              className="rounded-full"
              style={{
                width: selectedGeometry.transientStyle?.width ?? selectedGeometry.style.width,
                height: selectedGeometry.transientStyle?.width ?? selectedGeometry.style.width,
                backgroundColor: selectedGeometry.transientStyle?.color ?? selectedGeometry.style.color,
              }}
            />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            color={selectedGeometry.style.color}
            max={12}
            min={1}
            value={selectedGeometry.style.width}
            onChange={(width) => {
              if (selectedGeometry.type === "Line") {
                app.routes.transientUpdateSelectedLine({ width });
              } else if (selectedGeometry.type === "Point") {
                app.pins.transientUpdateSelectedPin({ width });
              }
            }}
            onChangeComplete={(width) => {
              if (selectedGeometry.type === "Line") {
                app.routes.updateSelectedLine({ width });
              } else if (selectedGeometry.type === "Point") {
                app.pins.updateSelectedPin({ width });
              }
            }}
          />
        </div>
      </div>

      {selectedGeometry.type === "Line" && (
        <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
          <div className="flex items-center">
            <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Outline</span>
          </div>
          <div className="mt-4">
            <OutlineSelector
              value={selectedGeometry.style.outline}
              onChange={(outline) => {
                app.routes.updateSelectedLine({ outline });
              }}
            />
          </div>
        </div>
      )}

      {selectedGeometry.type === "Point" && (
        <div className="mt-2 px-3 pb-2 border-b border-gray-700">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Icon</span>

          <div className="mt-2">
            <IconSelector
              value={selectedGeometry.style.icon}
              onChange={(icon) => {
                app.pins.updateSelectedPin({ icon });
              }}
            />
          </div>
        </div>
      )}

      {selectedGeometry.type === "Line" && (
        <div className="px-3 pb-2 mb-2 border-b border-gray-700">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Routes</span>

          <div className="mt-2">
            <SmartMatchingSelector
              value={selectedGeometry.smartMatching}
              onChange={(smartMatching) => {
                app.routes.updateSelectedLineSmartMatching(smartMatching);
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
  const color = useStore((store) => store.pins.style.color);
  const width = useStore((store) => store.pins.style.width);
  const icon = useStore((store) => store.pins.style.icon);

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
              app.pins.setStyle({ color });
            }}
            onChangeComplete={(color) => {
              app.pins.setStyle({ color });
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            color={color}
            max={12}
            min={1}
            value={width}
            onChange={(width) => {
              app.pins.setStyle({ width });
            }}
            onChangeComplete={(width) => {
              app.pins.setStyle({ width });
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
              app.pins.setStyle({ icon });
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
  const color = useStore((store) => store.routes.style.color);
  const width = useStore((store) => store.routes.style.width);
  const outline = useStore((store) => store.routes.style.outline);
  const smartMatching = useStore((store) => store.routes.smartMatching);

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
              app.routes.setStyle({ color });
            }}
            onChangeComplete={(color) => {
              app.routes.setStyle({ color });
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            color={color}
            max={12}
            min={1}
            value={width}
            onChange={(width) => {
              app.routes.setStyle({ width });
            }}
            onChangeComplete={(width) => {
              app.routes.setStyle({ width });
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Outline</span>
        </div>
        <div className="mt-4">
          <OutlineSelector
            value={outline}
            onChange={(outline) => {
              app.routes.setStyle({ outline });
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
              app.routes.setSmartMatching(smartMatching);
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
  const color = useStore((store) => store.routes.style.color);
  const width = useStore((store) => store.routes.style.width);
  const outline = useStore((store) => store.routes.style.outline);

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
              app.routes.setStyle({ color });
            }}
            onChangeComplete={(color) => {
              app.routes.setStyle({ color });
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Width</span>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </div>
        <div className="mt-4 px-1">
          <WidthSlider
            color={color}
            max={12}
            min={1}
            value={width}
            onChange={(width) => {
              app.routes.setStyle({ width });
            }}
            onChangeComplete={(width) => {
              app.routes.setStyle({ width });
            }}
          />
        </div>
      </div>

      <div className="mt-2 px-3 pb-3 mb-2 border-b border-gray-700">
        <div className="flex items-center">
          <span className="text-xs uppercase text-gray-500 font-light tracking-wide leading-none">Outline</span>
        </div>
        <div className="mt-4">
          <OutlineSelector
            value={outline}
            onChange={(outline) => {
              app.routes.setStyle({ outline });
            }}
          />
        </div>
      </div>
    </>
  );
};

const ExportSidebar: React.FC = () => {
  const app = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { shareFeature } = useBrowserFeatures();

  const onDownload = () => {
    if (!image) {
      return;
    }

    const a = document.createElement("a");
    a.href = image;
    a.download = "pelica";
    a.click();
  };

  const onShare = () => {
    if (!imageUrl) {
      return;
    }

    navigator.share({
      title: "Pelica Map",
      url: imageUrl,
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const image = app.export.generateImage();

      setImage(image);

      const data = new FormData();
      data.append("image", dataUrlToBlob(image));

      fetch("/api/upload-map", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: data,
      })
        .then((res) => res.json())
        .then((json) => {
          setImageUrl(json.url);
        })
        .catch((error) => {
          // @todo handle error
          console.error(error);
        });
    });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div className="mt-4 px-3 flex flex-col space-y-4">
        <Button
          className="bg-orange-700 text-gray-200 border border-orange-500 hover:border-orange-800 text-xs uppercase py-2 justify-center"
          disabled={!image}
          onClick={() => {
            onDownload();
          }}
        >
          Download
        </Button>

        {shareFeature && (
          <Button
            className="bg-orange-700 text-gray-200 border border-orange-500 hover:border-orange-800 text-xs uppercase py-2 justify-center"
            disabled={!imageUrl}
            onClick={() => {
              onShare();
            }}
          >
            Share
            {!imageUrl && (
              <div className="ml-4">
                <BounceLoader color={theme.colors.orange[500]} size={10} />
              </div>
            )}
          </Button>
        )}
      </div>

      <img className="mt-auto mx-auto mb-12 w-32 h-32" src="/images/logo.png" />
    </>
  );
};
