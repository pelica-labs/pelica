import { Menu } from "@headlessui/react";
import { Switch } from "@headlessui/react";
import classNames from "classnames";
import React, { useEffect, useRef } from "react";

import { ColorPicker } from "~/components/editor/controls/ColorPicker";
import { IconSelector } from "~/components/editor/controls/IconSelector";
import { LabelTextareaField } from "~/components/editor/controls/LabelTextareaField";
import { OutlineSelector } from "~/components/editor/controls/OutlineSelector";
import { PinSelector } from "~/components/editor/controls/PinSelector";
import { SmartMatchingSelector } from "~/components/editor/controls/SmartMatchingSelector";
import { WidthSlider } from "~/components/editor/controls/WidthSlider";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { PinPreview } from "~/components/editor/PinPreview";
import { Button } from "~/components/ui/Button";
import { Distance, formatDistance } from "~/components/ui/Distance";
import { Heading } from "~/components/ui/Heading";
import {
  DownloadIcon,
  InformationIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  TextIcon,
  TrashIcon,
} from "~/components/ui/Icon";
import { Tooltip } from "~/components/ui/Tooltip";
import { app, getState, useStore } from "~/core/app";
import { entityToFeature } from "~/core/entities";
import { MAX_PIN_SIZE, Pin } from "~/core/pins";
import { computeDistance, Route } from "~/core/routes";
import { getMapTitle, getSelectedEntities } from "~/core/selectors";
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE, Text } from "~/core/texts";
import { useLayout } from "~/hooks/useLayout";
import { exportGpx } from "~/lib/gpx";

export const SelectMenu: React.FC = () => {
  const textContainer = useRef<HTMLDivElement | null>(null);
  const selectedEntities = useStore((store) => getSelectedEntities(store));
  const layout = useLayout();

  useEffect(() => {
    textContainer.current?.querySelector("textarea")?.select();
  }, [textContainer.current]);

  if (selectedEntities.length === 0) {
    return <EmptySelectSection />;
  }

  const selectedEntity = selectedEntities[0] as Route | Pin | Text;
  const allRoutes = selectedEntities.every((entity) => entity.type === "Route");
  const allNonItineraryRoutes = selectedEntities.every((entity) => entity.type === "Route" && !entity.itinerary);
  const allPins = selectedEntities.every((entity) => entity.type === "Pin");
  const allTexts = selectedEntities.every((entity) => entity.type === "Text");
  const allSame = allRoutes || allPins || allTexts;

  let name = "Mixed";
  let minSize = 1;
  let maxSize = 12;
  if (allRoutes) {
    name = selectedEntities.length > 1 ? "Routes" : "Route";
  }
  if (allPins) {
    name = selectedEntities.length > 1 ? "Pins" : "Pin";
    maxSize = MAX_PIN_SIZE;
  }
  if (allTexts) {
    name = selectedEntities.length > 1 ? "Texts" : "Text";
    minSize = MIN_TEXT_SIZE;
    maxSize = MAX_TEXT_SIZE;
  }

  return (
    <>
      <MenuSection className="flex flex-col md:flex-row items-center md:justify-between px-3 md:py-2 bg-white">
        <MenuSectionHeader className="text-xs uppercase font-light tracking-wide leading-none">
          <Heading>{name}</Heading>
          {selectedEntities.length > 1 && <span className="ml-1 text-gray-600">({selectedEntities.length})</span>}
        </MenuSectionHeader>
        <Button
          className="bg-gray-300 text-gray-800 mt-4 md:mt-0"
          onClick={() => {
            app.selection.deleteSelectedEntities();
          }}
        >
          <TrashIcon className="w-2 h-2 md:w-3 md:h-3" />
        </Button>
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Color</Heading>
          <div
            className="ml-2 w-3 h-3 rounded-full border border-gray-200"
            style={{ backgroundColor: selectedEntity.transientStyle?.color ?? selectedEntity.style.color }}
          />
        </MenuSectionHeader>
        <div className="mt-4">
          <ColorPicker
            value={selectedEntity.style.color}
            onChange={(color) => {
              if (allRoutes) {
                app.routes.transientUpdateSelectedLine({ color });
              } else if (allPins) {
                app.pins.transientUpdateSelectedPin({ color });
              } else if (allTexts) {
                app.texts.transientUpdateSelectedText({ color });
              } else {
                app.selection.transientUpdateSelection({ color });
              }
            }}
            onChangeComplete={(color) => {
              if (allRoutes) {
                app.routes.updateSelectedLine({ color });
              } else if (allPins) {
                app.pins.updateSelectedPin({ color });
              } else if (allTexts) {
                app.texts.updateSelectedText({ color });
              } else {
                app.selection.updateSelection({ color });
              }
            }}
          />
        </div>
      </MenuSection>

      {allSame && (
        <MenuSection>
          <MenuSectionHeader>
            {allRoutes && (
              <>
                <Heading>Width</Heading>
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
              </>
            )}
            {!allRoutes && (
              <>
                <Heading>Size</Heading>
                <div className="ml-2 text-2xs text-gray-600 tracking-wide leading-none">
                  {selectedEntity.transientStyle?.width ?? selectedEntity.style.width}
                  {allTexts && <span className="text-gray-400 ml-px">px</span>}
                </div>
              </>
            )}
          </MenuSectionHeader>

          <div className="mt-5 md:mt-4 px-1 md:w-full flex-1 flex justify-center mb-5 md:mb-0">
            <WidthSlider
              color={selectedEntity.style.color}
              max={maxSize}
              min={minSize}
              value={selectedEntity.style.width}
              onChange={(width) => {
                if (allRoutes) {
                  app.routes.transientUpdateSelectedLine({ width });
                } else if (allPins) {
                  app.pins.transientUpdateSelectedPin({ width });
                } else if (allTexts) {
                  app.texts.transientUpdateSelectedText({ width });
                }
              }}
              onChangeComplete={(width) => {
                if (allRoutes) {
                  app.routes.updateSelectedLine({ width });
                } else if (allPins) {
                  app.pins.updateSelectedPin({ width });
                } else if (allTexts) {
                  app.texts.updateSelectedText({ width });
                }
              }}
            />
          </div>
        </MenuSection>
      )}

      {(allRoutes || allTexts) && (selectedEntity.type === "Route" || selectedEntity.type === "Text") && (
        <MenuSection>
          <MenuSectionHeader>
            <Heading>Outline</Heading>
          </MenuSectionHeader>
          <div className="mt-4 w-40" style={{ marginLeft: layout.horizontal ? -4 : 0 }}>
            <OutlineSelector
              value={selectedEntity.style.outline}
              onChange={(outline) => {
                if (selectedEntity.type === "Route") {
                  app.routes.updateSelectedLine({ outline });
                } else if (selectedEntity.type === "Text") {
                  app.texts.updateSelectedText({ outline });
                }
              }}
            />
          </div>
        </MenuSection>
      )}

      {allPins && selectedEntity.type === "Pin" && (
        <MenuSection>
          <MenuSectionHeader>
            <Heading>Icon & pin</Heading>
          </MenuSectionHeader>

          <div className="mt-2 flex items-center space-between w-full">
            <div className="flex flex-col w-full">
              <IconSelector
                value={selectedEntity.style.icon}
                onChange={(icon) => {
                  app.pins.transientUpdateSelectedPin({ icon });
                }}
                onChangeComplete={(icon) => {
                  app.pins.updateSelectedPin({ icon });
                }}
              />
              <PinSelector
                value={selectedEntity.style.pinType}
                onChange={(pinType) => {
                  app.pins.transientUpdateSelectedPin({ pinType });
                }}
                onChangeComplete={(pinType) => {
                  app.pins.updateSelectedPin({ pinType });
                }}
              />
            </div>
            <div className="mr-1 ml-4">
              <PinPreview
                color={selectedEntity.transientStyle?.color ?? selectedEntity.style.color}
                icon={selectedEntity.transientStyle?.icon ?? selectedEntity.style.icon}
                pinType={selectedEntity.transientStyle?.pinType ?? selectedEntity.style.pinType}
              />
            </div>
          </div>
        </MenuSection>
      )}

      {allTexts && selectedEntity.type === "Text" && selectedEntities.length === 1 && (
        <MenuSection>
          <MenuSectionHeader>
            <Heading>Text</Heading>
          </MenuSectionHeader>

          <div ref={textContainer} className="mt-3 w-56 md:w-full">
            <LabelTextareaField
              value={selectedEntity.transientStyle?.label ?? selectedEntity.style.label}
              onChange={(label) => {
                app.texts.transientUpdateSelectedText({ label });
              }}
              onChangeComplete={(label) => {
                if (!label) {
                  app.selection.deleteSelectedEntities();
                } else {
                  app.texts.updateSelectedText({ label });
                }
              }}
            />
          </div>
        </MenuSection>
      )}

      {allNonItineraryRoutes && selectedEntity.type === "Route" && (
        <MenuSection>
          <MenuSectionHeader>
            <Heading>Routes</Heading>
          </MenuSectionHeader>

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

          {selectedEntity.closed && (
            <Switch.Group as="div" className="flex items-center mt-2 w-40 md:w-full">
              <Switch.Label className="text-xs flex-1">Fill area</Switch.Label>
              <Switch
                as="button"
                checked={selectedEntity.filled}
                className={classNames(
                  { "bg-orange-600": selectedEntity.filled, "bg-gray-400": !selectedEntity.filled },
                  "relative inline-flex flex-shrink-0 h-4 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-7 focus:outline-none focus:ring"
                )}
                onChange={() => {
                  app.routes.toggleSelectedEntityFill();
                }}
              >
                {({ checked }) => (
                  <span
                    className={classNames(
                      {
                        "translate-x-3": checked,
                        "translate-x-0": !checked,
                      },
                      "inline-block w-3 h-3 transition duration-200 ease-in-out transform bg-white rounded-full"
                    )}
                  />
                )}
              </Switch>

              <Tooltip
                placement="left"
                text={<span className="w-64">Fill the inside of the area with a light color</span>}
              >
                <InformationIcon className="ml-2 w-3 h-3 cursor-pointer" />
              </Tooltip>
            </Switch.Group>
          )}
        </MenuSection>
      )}

      {selectedEntity.type === "Route" && (
        <MenuSection className="relative md:mt-auto">
          <MenuSectionHeader>
            <Heading>Inspect</Heading>

            <Menu>
              {({ open }) => (
                <>
                  <span className="relative flex rounded-md shadow-sm ml-auto">
                    <Menu.Button as="div">
                      <Tooltip className="ml-1 block" placement="left" text="Download route">
                        <Button className="py-px px-px">
                          <DownloadIcon className="w-4 h-4 md:w-3 md:h-3" />
                        </Button>
                      </Tooltip>
                    </Menu.Button>
                  </span>
                  {open && (
                    <Menu.Items
                      static
                      className="absolute z-50 mb-12 mr-2 w-48 bottom-0 right-0 origin-top-right bg-white border rounded shadow outline-none py-1"
                    >
                      <div className="flex flex-col">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              className={classNames({
                                "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200 cursor-pointer": true,
                                "bg-orange-200": active,
                              })}
                              onClick={async () => {
                                const title = getMapTitle() || "Untitled";
                                const gpx = exportGpx(title, selectedEntity);

                                const a = document.createElement("a");
                                a.href = `data:application/xml;base64,${btoa(gpx)}`;
                                a.download = `${title}.gpx`;

                                a.click();
                              }}
                            >
                              Download as GPX
                            </a>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <a
                              className={classNames({
                                "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200 cursor-pointer": true,
                                "bg-orange-200": active,
                              })}
                              onClick={async () => {
                                const title = getMapTitle() || "Untitled";
                                const json = entityToFeature(selectedEntity);
                                if (!json) {
                                  return;
                                }

                                const a = document.createElement("a");
                                a.href = `data:application/json;base64,${btoa(JSON.stringify(json))}`;
                                a.download = `${title}.json`;

                                a.click();
                              }}
                            >
                              Download as GeoJSON
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
          </MenuSectionHeader>

          <div className="mt-5 md:mt-4 w-32 md:w-full">
            <div className="flex items-center text-xs w-full">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(selectedEntity)} />

              <Tooltip className="ml-1" placement="left" text="Insert distance on map">
                <Button
                  className="ml-3 py-px px-px"
                  onClick={() => {
                    const text = formatDistance(computeDistance(selectedEntity), getState().units.distance);

                    app.texts.attachToRoute(selectedEntity, text);
                  }}
                >
                  <PlusIcon className="w-4 h-4 md:w-3 md:h-3" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </MenuSection>
      )}
    </>
  );
};

const EmptySelectSection: React.FC = () => {
  return (
    <MenuSection>
      <div className="flex items-start text-sm md:text-xs">
        <InformationIcon className="w-4 h-4 md:hidden mr-3 md:mr-0 mt-1" />
        <div className="flex flex-col md:space-y-4">
          <span>Select a route, pin or text by taping on them.</span>
          <span>Select multiple items by drawing a rectangle around them.</span>

          <div className="flex md:flex-col md:space-x-0 md:space-y-1 space-x-2 border-t border-gray-200 mt-5 pt-5 md:mt-2 md:pt-3">
            <Button
              className="text-center space-x-2"
              onClick={() => {
                app.editor.setEditorMode("route");
              }}
            >
              <PencilIcon className="w-4 h-4" />
              <span className="flex-1 text-center">Draw a route</span>
            </Button>
            <Button
              className="text-center space-x-2"
              onClick={() => {
                app.editor.setEditorMode("pin");
              }}
            >
              <PinIcon className="w-4 h-4" />
              <span className="flex-1 text-center">Add a pin</span>
            </Button>
            <Button
              className="text-center space-x-2"
              onClick={() => {
                app.editor.setEditorMode("text");
              }}
            >
              <TextIcon className="w-4 h-4" />
              <span className="flex-1 text-center">Add text</span>
            </Button>
          </div>
        </div>
      </div>
    </MenuSection>
  );
};
