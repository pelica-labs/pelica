import classNames from "classnames";
import React from "react";

import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { TrashIcon } from "~/components/Icon";
import { IconSelector } from "~/components/IconSelector";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { WidthSlider } from "~/components/WidthSlider";
import { useApp, useStore } from "~/core/app";
import { Pin } from "~/core/pins";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntities } from "~/core/selectors";

export const SelectSidebar: React.FC = () => {
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
