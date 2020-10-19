import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import BounceLoader from "react-spinners/BounceLoader";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { TrashIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { MenuButton } from "~/components/MenuButton";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { StyleSelector } from "~/components/StyleSelector";
import { Toolbar } from "~/components/Toolbar";
import { WidthSlider } from "~/components/WidthSlider";
import { useApp, useStore } from "~/core/app";
import { Pin } from "~/core/pins";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntities, getSelectedEntity } from "~/core/selectors";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { useDimensions } from "~/hooks/useDimensions";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { Style } from "~/lib/style";
import { theme } from "~/styles/tailwind";

type Props = {
  initialStyles: Style[];
};

export const Sidebar: React.FC<Props> = ({ initialStyles }) => {
  const editorMode = useStore((store) => store.editor.mode);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);

  return (
    <div ref={sidebarRef} className="flex-grow relative flex items-end">
      {sidebarDimensions && (
        <div
          className="fixed top-0 flex flex-col bg-white border m-2 p-1 shadow rounded"
          style={{ right: sidebarDimensions.width }}
        >
          <Toolbar />
        </div>
      )}

      <div className="flex flex-col bg-white text-gray-800 w-32 md:w-48 lg:w-64 h-full overflow-y-auto shadow-md">
        <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-100 border-b">
          <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">
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
  const selectedEntities = useStore((store) => getSelectedEntities(store));

  if (selectedEntities.length === 0) {
    return null;
  }

  const selectedEntity = selectedEntities[0] as Route | Pin;
  const allRoutes = selectedEntities.every((entity) => entity.type === "Route");
  const allNonItineraryRoutes = selectedEntities.every((entity) => entity.type === "Route" && !entity.itinerary);
  const allPins = selectedEntities.every((entity) => entity.type === "Pin");
  const allSame = allRoutes || allPins;

  let name = "Mixed";
  if (allRoutes) {
    name = selectedEntities.length > 1 ? "Routes" : "Route";
  }
  if (allPins) {
    name = selectedEntities.length > 1 ? "Pins" : "pin";
  }

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-t bg-white">
        <span className="text-xs uppercase font-light tracking-wide leading-none">
          <span>{name}</span>
          {selectedEntities.length > 1 && <span className="ml-1 text-gray-600">({selectedEntities.length})</span>}
        </span>
        <Button
          className="bg-gray-300 text-gray-800"
          onClick={() => {
            app.selection.deleteSelectedEntities();
          }}
        >
          <TrashIcon className="w-2 h-2 md:w-3 md:h-3" />
        </Button>
      </div>

      {allSame && (
        <div className="mt-4 px-2 pb-2 mb-2 border-b">
          <div className="flex items-center px-1">
            <SidebarHeading>Color</SidebarHeading>
            <div
              className="ml-2 w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: selectedEntity.transientStyle?.color ?? selectedEntity.style.color }}
            />
          </div>
          <div className="mt-4">
            <ColorPicker
              value={selectedEntity.style.color}
              onChange={(color) => {
                if (allRoutes) {
                  app.routes.transientUpdateSelectedLine({ color });
                } else if (allPins) {
                  app.pins.transientUpdateSelectedPin({ color });
                }
              }}
              onChangeComplete={(color) => {
                if (allRoutes) {
                  app.routes.updateSelectedLine({ color });
                } else if (allPins) {
                  app.pins.updateSelectedPin({ color });
                }
              }}
            />
          </div>
        </div>
      )}

      {allSame && (
        <div className="mt-2 px-3 pb-3 mb-2 border-b">
          <div className="flex items-center">
            <SidebarHeading>Width</SidebarHeading>
            <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
              <div
                className="rounded-full"
                style={{
                  width: selectedEntity.transientStyle?.width ?? selectedEntity.style.width,
                  height: selectedEntity.transientStyle?.width ?? selectedEntity.style.width,
                  backgroundColor: selectedEntity.transientStyle?.color ?? selectedEntity.style.color,
                }}
              />
            </div>
          </div>
          <div className="mt-4 px-1">
            <WidthSlider
              color={selectedEntity.style.color}
              max={12}
              min={1}
              value={selectedEntity.style.width}
              onChange={(width) => {
                if (allRoutes) {
                  app.routes.transientUpdateSelectedLine({ width });
                } else if (allPins) {
                  app.pins.transientUpdateSelectedPin({ width });
                }
              }}
              onChangeComplete={(width) => {
                if (allRoutes) {
                  app.routes.updateSelectedLine({ width });
                } else if (allPins) {
                  app.pins.updateSelectedPin({ width });
                }
              }}
            />
          </div>
        </div>
      )}

      {allRoutes && selectedEntity.type === "Route" && (
        <div className="mt-2 px-3 pb-3 mb-2 border-b">
          <div className="flex items-center">
            <SidebarHeading>Outline</SidebarHeading>
          </div>
          <div className="mt-4">
            <OutlineSelector
              value={selectedEntity.style.outline}
              onChange={(outline) => {
                app.routes.updateSelectedLine({ outline });
              }}
            />
          </div>
        </div>
      )}

      {allPins && selectedEntity.type === "Pin" && (
        <div className="px-3 pb-2 border-b">
          <SidebarHeading>Icon</SidebarHeading>

          <div className="mt-2">
            <IconSelector
              value={selectedEntity.style.icon}
              onChange={(icon) => {
                app.pins.updateSelectedPin({ icon });
              }}
            />
          </div>
        </div>
      )}

      {allNonItineraryRoutes && selectedEntity.type === "Route" && (
        <div className="px-3 pb-2 mb-2 border-b">
          <SidebarHeading>Routes</SidebarHeading>
          <div className="mt-2">
            <SmartMatchingSelector
              value={selectedEntity.smartMatching}
              onChange={(smartMatching) => {
                app.routes.updateSelectedLineSmartMatching(smartMatching);
              }}
            />
          </div>
        </div>
      )}

      {selectedEntity.type === "Route" && (
        <div className="mt-auto px-3 py-2 border-t">
          <SidebarHeading>Inspect</SidebarHeading>

          <div className="mt-2">
            <div className="flex items-center text-xs">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(selectedEntity)} />
            </div>
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
      <div className="mt-4 px-2 pb-2 mb-2 border-b">
        <div className="flex items-center px-1">
          <SidebarHeading>Color</SidebarHeading>
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

      <div className="mt-2 px-3 pb-3 mb-2 border-b">
        <div className="flex items-center">
          <SidebarHeading>Width</SidebarHeading>
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

      <div className="px-3 pb-2 mb-2 border-b">
        <SidebarHeading>Icon</SidebarHeading>

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
  const route = useStore((store) => getSelectedEntity(store) as Route);

  return (
    <>
      <div className="mt-4 px-2 pb-2 mb-2 border-b">
        <div className="flex items-center px-1">
          <SidebarHeading>Color</SidebarHeading>
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

      <div className="mt-2 px-3 pb-3 mb-2 border-b">
        <div className="flex items-center">
          <SidebarHeading>Width</SidebarHeading>
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

      <div className="mt-2 px-3 pb-3 mb-2 border-b">
        <div className="flex items-center">
          <SidebarHeading>Outline</SidebarHeading>
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

      <div className="px-3 pb-2 mb-2 border-b">
        <SidebarHeading>Routes</SidebarHeading>

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
        <SidebarHeading>Import</SidebarHeading>
        <Button
          className="bg-gray-300 text-gray-800 mt-1"
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

      {route && (
        <div className="mt-auto px-3 py-2 border-t">
          <SidebarHeading>Inspect</SidebarHeading>
          <div className="mt-2">
            <div className="flex items-center text-xs">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(route)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ItinerarySidebar: React.FC = () => {
  const app = useApp();
  const color = useStore((store) => store.routes.style.color);
  const width = useStore((store) => store.routes.style.width);
  const outline = useStore((store) => store.routes.style.outline);
  const route = useStore((store) => getSelectedEntity(store) as Route);

  return (
    <>
      <div className="mt-4 px-2 pb-2 mb-2 border-b">
        <div className="flex items-center px-1">
          <SidebarHeading>Color</SidebarHeading>
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

      <div className="mt-2 px-3 pb-3 mb-2 border-b">
        <div className="flex items-center">
          <SidebarHeading>Width</SidebarHeading>
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

      <div className="mt-2 px-3 pb-3 mb-2 border-b">
        <div className="flex items-center">
          <SidebarHeading>Outline</SidebarHeading>
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

      {route && (
        <div className="mt-auto px-3 py-2 mb-1 border-t">
          <SidebarHeading>Inspect</SidebarHeading>
          <div className="mt-2">
            <div className="flex items-center text-xs">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(route)} />
            </div>
          </div>
        </div>
      )}
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
          // @todo: handle error
          console.error(error);
        });
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div className="mt-4 px-3 flex flex-col space-y-4">
        <Button
          className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center"
          disabled={!image}
          onClick={() => {
            onDownload();
          }}
        >
          Download
        </Button>

        {shareFeature && (
          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center"
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

      <div className="flex justify-between items-center m-1 mt-auto border rounded p-1">
        <span className="text-2xs leading-tight">
          Prints use map data from Mapbox and Open Street Map and their data sources. To learn more, visit{" "}
          <a className="underline" href="https://www.mapbox.com/about/maps">
            https://www.mapbox.com/about/maps/
          </a>{" "}
          and{" "}
          <a className="underline" href="http://www.openstreetmap.org/copyright">
            http://www.openstreetmap.org/copyright
          </a>
          .
        </span>
      </div>
    </>
  );
};

const SidebarHeading: React.FC = ({ children }) => {
  return <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">{children}</span>;
};
