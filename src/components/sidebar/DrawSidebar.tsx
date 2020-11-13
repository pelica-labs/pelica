import { Switch } from "@headlessui/react";
import classNames from "classnames";
import React, { useRef } from "react";

import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { InformationIcon } from "~/components/Icon";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SidebarHeader, SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { Tooltip } from "~/components/Tooltip";
import { WidthSlider } from "~/components/WidthSlider";
import { app, useStore } from "~/core/app";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntity } from "~/core/selectors";
import { HotkeyView } from "~/hooks/useHotkey";

export const DrawSidebar: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const color = useStore((store) => store.routes.style.color);
  const width = useStore((store) => store.routes.style.width);
  const outline = useStore((store) => store.routes.style.outline);
  const smartMatching = useStore((store) => store.routes.smartMatching);
  const route = useStore((store) => getSelectedEntity(store) as Route);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const circleMode = useStore((store) => store.routes.circleMode);
  const keyboardAvailable = useStore((store) => store.platform.keyboard.available);

  return (
    <>
      <SidebarSection>
        <SidebarHeader className="px-1">
          <SidebarHeading>Color</SidebarHeading>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
        </SidebarHeader>
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
        <SidebarHeader>
          <SidebarHeading>Width</SidebarHeading>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </SidebarHeader>
        <div className="mt-5 md:mt-4 px-1 md:w-full flex-1 flex justify-center mb-5 md:mb-0">
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
        <SidebarHeader>
          <SidebarHeading>Outline</SidebarHeading>
        </SidebarHeader>
        <div className="mt-4 w-40" style={{ marginLeft: screenDimensions.md ? -4 : 0 }}>
          <OutlineSelector
            value={outline}
            onChange={(outline) => {
              app.routes.setStyle({ outline });
            }}
          />
        </div>
      </SidebarSection>

      <SidebarSection>
        <SidebarHeader>
          <SidebarHeading>Routes</SidebarHeading>
        </SidebarHeader>

        <div className="w-40 md:w-full">
          <Switch.Group as="div" className="flex items-center mt-4 w-40 md:w-full">
            <Switch.Label className="flex items-center text-xs flex-1">Draw circle</Switch.Label>
            <Switch
              as="button"
              checked={circleMode}
              className={classNames(
                { "bg-orange-600": circleMode, "bg-gray-400": !circleMode },
                "relative inline-flex flex-shrink-0 h-4 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-7 focus:outline-none focus:shadow-outline"
              )}
              onChange={() => {
                app.routes.toggleCircleMode();
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
              text={
                <span className="w-64 flex flex-col space-y-2">
                  <span>Draw a circle instead of a route.</span>
                  {keyboardAvailable && (
                    <span>
                      You can also hold <HotkeyView value="Shift" /> while drawing to achieve the same result.
                    </span>
                  )}
                </span>
              }
            >
              <InformationIcon className="ml-2 w-3 h-3 cursor-pointer" />
            </Tooltip>
          </Switch.Group>
        </div>

        <div className="mt-2 w-40 md:w-full">
          <SmartMatchingSelector
            disabled={circleMode}
            value={smartMatching}
            onChange={(smartMatching) => {
              app.routes.setSmartMatching(smartMatching);
            }}
          />
        </div>
      </SidebarSection>

      <SidebarSection>
        <SidebarHeader className="flex flex-col items-start space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between md:w-full">
          <SidebarHeading>Import</SidebarHeading>
          <Button
            className="bg-gray-300 text-gray-800"
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
                  app.imports.importFile(event.target.files[0]);
                }
              }}
            />
            <span className="text-xs">GPX</span>
          </Button>
        </SidebarHeader>
      </SidebarSection>

      {route && (
        <SidebarSection className="md:mt-auto">
          <SidebarHeader>
            <SidebarHeading>Inspect</SidebarHeading>
          </SidebarHeader>

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
