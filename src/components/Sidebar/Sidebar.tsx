import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import BounceLoader from "react-spinners/BounceLoader";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { TrashIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { OutlineSelector } from "~/components/OutlineSelector";
import { StyleSidebar } from "~/components/Sidebar/StyleSidebar";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { Toolbar } from "~/components/Toolbar";
import { WidthSlider } from "~/components/WidthSlider";
import { useApp, useStore } from "~/core/app";
import { Pin } from "~/core/pins";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntities, getSelectedEntity } from "~/core/selectors";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { useDimensions } from "~/hooks/useDimensions";
import { aspectRatios } from "~/lib/aspectRatio";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { Style } from "~/lib/style";
import { theme } from "~/styles/tailwind";

type Props = {
  initialStyles: Style[];
};

export const Sidebar: React.FC<Props> = ({ initialStyles }) => {
  const editorMode = useStore((store) => store.editor.mode);
  const screenDimensions = useStore((store) => store.screen.dimensions);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarDimensions = useDimensions(toolbarRef);

  useEffect(() => {
    sidebarRef.current?.scrollTo({ left: 0 });
  }, [editorMode]);

  return (
    <div className="flex-grow relative flex items-end">
      {sidebarDimensions && (
        <div
          ref={toolbarRef}
          className="fixed z-10 bottom-0 md:bottom-auto md:top-0 flex justify-between md:flex-col bg-white border md:m-2 p-1 md:shadow md:rounded overflow-x-auto"
          style={{
            right: screenDimensions.md ? sidebarDimensions.width : 0,
            left: screenDimensions.md ? "initial" : 0,
          }}
        >
          <Toolbar />
        </div>
      )}

      <div
        ref={sidebarRef}
        className="flex pt-3 md:pt-0 pb-2 md:pb-0 divide-x md:flex-col md:space-x-0 md:divide-y h-24 bg-white text-gray-800 md:w-48 xl:w-64 md:h-full overflow-y-auto overflow-x-auto md:shadow-md"
        style={{
          marginBottom: screenDimensions.md ? "initial" : (toolbarDimensions?.height ?? 0) + 10,
        }}
      >
        {screenDimensions.md && (
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-100 border-l">
            <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">
              <Trans i18nKey={`editor.mode.${editorMode}`} />
            </span>
          </div>
        )}

        {editorMode === "style" && <StyleSidebar initialStyles={initialStyles} />}

        {editorMode === "select" && <SelectSidebar />}

        {editorMode === "pin" && <PinSidebar />}

        {editorMode === "draw" && <DrawSidebar />}

        {editorMode === "itinerary" && <ItinerarySidebar />}

        {editorMode === "export" && <ExportSidebar />}
      </div>
    </div>
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
      <div className="flex flex-col md:flex-row items-center md:justify-between px-3 md:py-2 bg-white">
        <div className="text-xs uppercase font-light tracking-wide leading-none">
          <span>{name}</span>
          {selectedEntities.length > 1 && <span className="ml-1 text-gray-600">({selectedEntities.length})</span>}
        </div>
        <Button
          className="bg-gray-300 text-gray-800 mt-4 md:mt-0"
          onClick={() => {
            app.selection.deleteSelectedEntities();
          }}
        >
          <TrashIcon className="w-2 h-2 md:w-3 md:h-3" />
        </Button>
      </div>

      {allSame && (
        <SidebarSection>
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
        </SidebarSection>
      )}

      {allSame && (
        <SidebarSection>
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

          <div className="mt-5 md:mt-4 px-1 w-32 md:w-auto">
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
        </SidebarSection>
      )}

      {allRoutes && selectedEntity.type === "Route" && (
        <SidebarSection>
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
        </SidebarSection>
      )}

      {allPins && selectedEntity.type === "Pin" && (
        <SidebarSection>
          <div className="flex items-center">
            <SidebarHeading>Icon</SidebarHeading>
          </div>

          <div className="mt-4 md:mt-2">
            <IconSelector
              value={selectedEntity.style.icon}
              onChange={(icon) => {
                app.pins.updateSelectedPin({ icon });
              }}
            />
          </div>
        </SidebarSection>
      )}

      {allNonItineraryRoutes && selectedEntity.type === "Route" && (
        <SidebarSection>
          <div className="flex items-center">
            <SidebarHeading>Routes</SidebarHeading>
          </div>

          <div
            className={classNames({
              "md:mt-4 w-40 md:w-full": true,
              "mt-5": !selectedEntity.smartMatching.enabled,
              "mt-2": selectedEntity.smartMatching.enabled,
            })}
          >
            <SmartMatchingSelector
              value={selectedEntity.smartMatching}
              onChange={(smartMatching) => {
                app.routes.updateSelectedLineSmartMatching(smartMatching);
              }}
            />
          </div>
        </SidebarSection>
      )}

      {selectedEntity.type === "Route" && (
        <SidebarSection className="md:mt-auto">
          <div className="flex items-center">
            <SidebarHeading>Inspect</SidebarHeading>
          </div>

          <div className="mt-5 md:mt-4">
            <div className="flex items-center text-xs">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(selectedEntity)} />
            </div>
          </div>
        </SidebarSection>
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
      <SidebarSection>
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
      </SidebarSection>

      <SidebarSection>
        <div className="flex items-center">
          <SidebarHeading>Width</SidebarHeading>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </div>

        <div className="mt-5 md:mt-4 px-1 w-32 md:w-auto">
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
      </SidebarSection>

      <SidebarSection>
        <div className="flex items-center">
          <SidebarHeading>Icon</SidebarHeading>
        </div>

        <div className="mt-5 md:mt-2">
          <IconSelector
            value={icon}
            onChange={(icon) => {
              app.pins.setStyle({ icon });
            }}
          />
        </div>
      </SidebarSection>
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
      <SidebarSection>
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
      </SidebarSection>

      <SidebarSection>
        <div className="flex items-center">
          <SidebarHeading>Width</SidebarHeading>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </div>
        <div className="mt-5 md:mt-4 px-1 w-32 md:w-auto">
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
      </SidebarSection>

      <SidebarSection>
        <div className="flex items-center">
          <SidebarHeading>Outline</SidebarHeading>
        </div>
        <div className="mt-4" style={{ marginLeft: -4 }}>
          <OutlineSelector
            value={outline}
            onChange={(outline) => {
              app.routes.setStyle({ outline });
            }}
          />
        </div>
      </SidebarSection>

      <SidebarSection>
        <div className="flex items-center">
          <SidebarHeading>Routes</SidebarHeading>
        </div>

        <div
          className={classNames({
            "md:mt-4 w-40 md:w-full": true,
            "mt-5": !smartMatching.enabled,
            "mt-2": smartMatching.enabled,
          })}
        >
          <SmartMatchingSelector
            value={smartMatching}
            onChange={(smartMatching) => {
              app.routes.setSmartMatching(smartMatching);
            }}
          />
        </div>
      </SidebarSection>

      <SidebarSection>
        <div className="flex flex-col items-start space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
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
                  app.imports.importGpx(event.target.files[0]);
                }
              }}
            />
            <span className="text-xs">GPX</span>
          </Button>
        </div>
      </SidebarSection>

      {route && (
        <SidebarSection className="md:mt-auto">
          <div className="flex items-center">
            <SidebarHeading>Inspect</SidebarHeading>
          </div>

          <div className="mt-5 md:mt-4">
            <div className="flex items-center text-xs">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(route)} />
            </div>
          </div>
        </SidebarSection>
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
      <SidebarSection>
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
      </SidebarSection>

      <SidebarSection>
        <div className="flex items-center">
          <SidebarHeading>Width</SidebarHeading>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </div>

        <div className="mt-5 md:mt-4 px-1 w-32 md:w-auto">
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
      </SidebarSection>

      <SidebarSection>
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
      </SidebarSection>

      {route && (
        <div className="md:mt-auto md:py-4 px-3">
          <div className="flex items-center">
            <SidebarHeading>Inspect</SidebarHeading>
          </div>
          <div className="mt-5 md:mt-4">
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
  const imageData = useStore((store) => store.exports.imageData);
  const aspectRatio = useStore((store) => store.editor.aspectRatio);
  const { ratio } = aspectRatios[aspectRatio];

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { shareFeature } = useBrowserFeatures();

  const onDownload = () => {
    if (!imageData) {
      return;
    }

    const a = document.createElement("a");
    a.href = imageData;
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
    app.exports.prepareCanvas();
  }, []);

  useEffect(() => {
    if (!imageData) {
      return;
    }

    setImageBlob(dataUrlToBlob(imageData));
  }, [imageData]);

  useEffect(() => {
    if (!imageBlob) {
      return;
    }

    const timeout = setTimeout(() => {
      const data = new FormData();

      data.append("image", imageBlob);

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
  }, [imageBlob]);

  return (
    <>
      <div className="flex md:flex-col md:divide-y md:divide-x-0 divide-x md:h-full">
        <SidebarSection className="flex flex-col space-y-1 md:space-y-2 w-48 md:w-auto">
          <AspectRatioSelector
            value={aspectRatio}
            onChange={(aspectRatio) => {
              app.editor.setAspectRatio(aspectRatio);
            }}
          />
        </SidebarSection>

        <SidebarSection className="flex flex-col space-y-1 md:space-y-2 w-40 md:w-auto">
          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center"
            disabled={!imageData}
            onClick={() => {
              onDownload();
            }}
          >
            Download
            {!imageData && (
              <div className="ml-4">
                <BounceLoader color={theme.colors.orange[500]} size={10} />
              </div>
            )}
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
        </SidebarSection>

        <SidebarSection className="flex flex-col space-y-3 w-64 md:w-auto">
          <div className="flex items-center">
            <SidebarHeading>Output format</SidebarHeading>
          </div>
          <div className="flex-col md:space-y-1">
            <div className="text-xs flex justify-between">
              <span className="flex-1 mr-4">Format</span>
              <span>JPEG</span>
            </div>
            {ratio && (
              <>
                <div className="text-xs flex justify-between">
                  <span className="flex-1 mr-4">Resolution</span>
                  <span>
                    {ratio[0].toFixed(0)} x {ratio[1].toFixed(0)} px
                  </span>
                </div>
              </>
            )}
          </div>
        </SidebarSection>

        <div className="md:mt-auto px-3 md:pt-3 md:pb-2 w-64 md:w-auto">
          <div className="flex items-center">
            <SidebarHeading>Copyright</SidebarHeading>
          </div>

          <div className="flex justify-between items-center mt-2 overflow-x-hidden">
            <span className="text-2xs leading-tight">
              Prints use map data and styles from Mapbox and OpenStreetMap and must be attributed accordingly. To learn
              more, see{" "}
              <a className="underline" href="https://docs.mapbox.com/help/how-mapbox-works/attribution/">
                Mapbox
              </a>{" "}
              and{" "}
              <a className="underline" href="http://www.openstreetmap.org/copyright">
                OSM
              </a>{" "}
              attribution requirements.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarHeading: React.FC = ({ children }) => {
  return <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">{children}</span>;
};

const SidebarSection: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return <div className={classNames("px-3 md:py-4", props.className)}>{props.children}</div>;
};
