import React from "react";

import { ColorPicker } from "~/components/ColorPicker";
import { IconSelector } from "~/components/IconSelector";
import { PinLabelField } from "~/components/PinLabelField";
import { PinPreview } from "~/components/PinPreview";
import { PinSelector } from "~/components/PinSelector";
import { SidebarHeader, SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { WidthSlider } from "~/components/WidthSlider";
import { app, useStore } from "~/core/app";
import { MAX_PIN_SIZE } from "~/core/pins";

export const PinSidebar: React.FC = () => {
  const color = useStore((store) => store.pins.style.color);
  const width = useStore((store) => store.pins.style.width);
  const icon = useStore((store) => store.pins.style.icon);
  const pinType = useStore((store) => store.pins.style.pinType);
  const label = useStore((store) => store.pins.style.label);

  return (
    <>
      <SidebarSection>
        <SidebarHeader>
          <SidebarHeading>Color</SidebarHeading>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
        </SidebarHeader>
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
        <SidebarHeader>
          <SidebarHeading>Width</SidebarHeading>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </SidebarHeader>

        <div className="mt-5 md:mt-4 px-1 md:w-full flex-1 flex justify-center mb-5 md:mb-0">
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
        <SidebarHeader>
          <SidebarHeading>Icon & pin</SidebarHeading>
        </SidebarHeader>

        <div className="mt-2 flex items-center space-between w-full">
          <div className="flex flex-col w-full">
            <IconSelector
              value={icon}
              onChange={(icon) => {
                app.pins.setStyle({ icon });
              }}
              onChangeComplete={(icon) => {
                app.pins.setStyle({ icon });
              }}
            />
            <PinSelector
              value={pinType}
              onChange={(pinType) => {
                app.pins.setStyle({ pinType });
              }}
              onChangeComplete={(pinType) => {
                app.pins.setStyle({ pinType });
              }}
            />
          </div>
          <div className="mr-1 ml-4">
            <PinPreview color={color} icon={icon} pinType={pinType} />
          </div>
        </div>
      </SidebarSection>

      <SidebarSection>
        <SidebarHeader>
          <SidebarHeading>Label</SidebarHeading>
        </SidebarHeader>

        <div className="mt-3 w-full">
          <PinLabelField
            value={label}
            onChange={(label) => {
              app.pins.setStyle({ label });
            }}
          />
        </div>
      </SidebarSection>
    </>
  );
};
