import React from "react";

import { ColorPicker } from "~/components/ColorPicker";
import { IconSelector } from "~/components/IconSelector";
import { SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { WidthSlider } from "~/components/WidthSlider";
import { app, useStore } from "~/core/app";
import { MAX_PIN_SIZE } from "~/core/pins";

export const PinSidebar: React.FC = () => {
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
            max={MAX_PIN_SIZE}
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
