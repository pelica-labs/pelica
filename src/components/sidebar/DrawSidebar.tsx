import React, { useRef } from "react";

import { Button } from "~/components/Button";
import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SidebarHeader, SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
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
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

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

        <div className="mt-5 md:mt-4 w-40 md:w-full">
          <SmartMatchingSelector
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
