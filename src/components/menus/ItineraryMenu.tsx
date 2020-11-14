import React from "react";

import { ColorPicker } from "~/components/ColorPicker";
import { Distance } from "~/components/Distance";
import { Heading } from "~/components/Heading";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SidebarHeader, SidebarSection } from "~/components/Sidebar";
import { WidthSlider } from "~/components/WidthSlider";
import { app, useStore } from "~/core/app";
import { computeDistance, Route } from "~/core/routes";
import { getSelectedEntity } from "~/core/selectors";

export const ItineraryMenu: React.FC = () => {
  const color = useStore((store) => store.routes.style.color);
  const width = useStore((store) => store.routes.style.width);
  const outline = useStore((store) => store.routes.style.outline);
  const route = useStore((store) => getSelectedEntity(store) as Route);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

  return (
    <>
      <SidebarSection>
        <SidebarHeader>
          <Heading>Color</Heading>
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
          <Heading>Width</Heading>
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
          <Heading>Outline</Heading>
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

      {route && (
        <SidebarSection className="md:mt-auto">
          <SidebarHeader>
            <Heading>Inspect</Heading>
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
