import classNames from "classnames";
import React, { useRef } from "react";

import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { SmartMatchingSelector } from "~/components/SmartMatchingSelector";
import { WidthSlider } from "~/components/WidthSlider";
import { app, useStore } from "~/core/app";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntity } from "~/core/selectors";

export const DrawSidebar: React.FC = () => {
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
