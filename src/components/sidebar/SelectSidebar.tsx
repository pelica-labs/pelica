import classNames from "classnames";
import React, { useEffect, useRef } from "react";

import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance, formatDistance } from "~/components/Distance";
import { PlusIcon, TrashIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { LabelTextareaField } from "~/components/LabelTextareaField";
import { OutlineSelector } from "~/components/OutlineSelector";
import { PinPreview } from "~/components/PinPreview";
import { PinSelector } from "~/components/PinSelector";
import { SidebarHeader, SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { Tooltip } from "~/components/Tooltip";
import { WidthSlider } from "~/components/WidthSlider";
import { app, getState, useStore } from "~/core/app";
import { MAX_PIN_SIZE, Pin } from "~/core/pins";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntities } from "~/core/selectors";
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE, Text } from "~/core/texts";

export const SelectSidebar: React.FC = () => {
  const textContainer = useRef<HTMLDivElement | null>(null);
  const selectedEntities = useStore((store) => getSelectedEntities(store));
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

  useEffect(() => {
    textContainer.current?.querySelector("textarea")?.select();
  }, [textContainer.current]);

  if (selectedEntities.length === 0) {
    return null;
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
      <SidebarSection className="flex flex-col md:flex-row items-center md:justify-between px-3 md:py-2 bg-white">
        <SidebarHeader className="text-xs uppercase font-light tracking-wide leading-none">
          <SidebarHeading>{name}</SidebarHeading>
          {selectedEntities.length > 1 && <span className="ml-1 text-gray-600">({selectedEntities.length})</span>}
        </SidebarHeader>
        <Button
          className="bg-gray-300 text-gray-800 mt-4 md:mt-0"
          onClick={() => {
            app.selection.deleteSelectedEntities();
          }}
        >
          <TrashIcon className="w-2 h-2 md:w-3 md:h-3" />
        </Button>
      </SidebarSection>

      {allSame && (
        <SidebarSection>
          <SidebarHeader>
            <SidebarHeading>Color</SidebarHeading>
            <div
              className="ml-2 w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: selectedEntity.transientStyle?.color ?? selectedEntity.style.color }}
            />
          </SidebarHeader>
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
                }
              }}
              onChangeComplete={(color) => {
                if (allRoutes) {
                  app.routes.updateSelectedLine({ color });
                } else if (allPins) {
                  app.pins.updateSelectedPin({ color });
                } else if (allTexts) {
                  app.texts.updateSelectedText({ color });
                }
              }}
            />
          </div>
        </SidebarSection>
      )}

      {allSame && (
        <SidebarSection>
          <SidebarHeader>
            {allRoutes && (
              <>
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
              </>
            )}
            {!allRoutes && (
              <>
                <SidebarHeading>Size</SidebarHeading>
                <div className="ml-2 text-2xs text-gray-600 tracking-wide leading-none">
                  {selectedEntity.transientStyle?.width ?? selectedEntity.style.width}
                  {allTexts && <span className="text-gray-400 ml-px">px</span>}
                </div>
              </>
            )}
          </SidebarHeader>

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
        </SidebarSection>
      )}

      {(allRoutes || allTexts) && (selectedEntity.type === "Route" || selectedEntity.type === "Text") && (
        <SidebarSection>
          <SidebarHeader>
            <SidebarHeading>Outline</SidebarHeading>
          </SidebarHeader>
          <div className="mt-4 w-40" style={{ marginLeft: screenDimensions.md ? -4 : 0 }}>
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
        </SidebarSection>
      )}

      {allPins && selectedEntity.type === "Pin" && (
        <SidebarSection>
          <SidebarHeader>
            <SidebarHeading>Icon & pin</SidebarHeading>
          </SidebarHeader>

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
        </SidebarSection>
      )}

      {allTexts && selectedEntity.type === "Text" && selectedEntities.length === 1 && (
        <SidebarSection>
          <SidebarHeader>
            <SidebarHeading>Text</SidebarHeading>
          </SidebarHeader>

          <div ref={textContainer} className="mt-3 w-56 md:w-full">
            <LabelTextareaField
              value={selectedEntity.transientStyle?.label ?? selectedEntity.style.label}
              onChange={(label) => {
                app.texts.transientUpdateSelectedText({ label });
              }}
              onChangeComplete={(label) => {
                app.texts.updateSelectedText({ label });
              }}
            />
          </div>
        </SidebarSection>
      )}

      {allNonItineraryRoutes && selectedEntity.type === "Route" && (
        <SidebarSection>
          <SidebarHeader>
            <SidebarHeading>Routes</SidebarHeading>
          </SidebarHeader>

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
          <SidebarHeader>
            <SidebarHeading>Inspect</SidebarHeading>
          </SidebarHeader>

          <div className="mt-5 md:mt-4 w-32 md:w-full">
            <div className="flex items-center text-xs w-full">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(selectedEntity)} />

              <Tooltip className="ml-auto" placement="left" text="Insert distance on map">
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
        </SidebarSection>
      )}
    </>
  );
};
