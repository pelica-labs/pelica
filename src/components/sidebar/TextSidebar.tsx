import React, { useEffect, useRef } from "react";

import { ColorPicker } from "~/components/ColorPicker";
import { LabelTextareaField } from "~/components/LabelTextareaField";
import { OutlineSelector } from "~/components/OutlineSelector";
import { SidebarHeader, SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { WidthSlider } from "~/components/WidthSlider";
import { app, useStore } from "~/core/app";
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE } from "~/core/texts";

export const TextSidebar: React.FC = () => {
  const textContainer = useRef<HTMLDivElement | null>(null);
  const color = useStore((store) => store.texts.style.color);
  const width = useStore((store) => store.texts.style.width);
  const outline = useStore((store) => store.texts.style.outline);
  const label = useStore((store) => store.texts.style.label);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

  useEffect(() => {
    const textArea = textContainer.current?.querySelector("textarea");
    if (!textArea) {
      return;
    }

    textArea.value = "Text";
  }, []);

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
              app.texts.setStyle({ color });
            }}
            onChangeComplete={(color) => {
              app.texts.setStyle({ color });
            }}
          />
        </div>
      </SidebarSection>

      <SidebarSection>
        <SidebarHeader>
          <SidebarHeading>Size</SidebarHeading>
          <div className="ml-2 text-2xs text-gray-600 tracking-wide leading-none">
            {width}
            <span className="text-gray-400 ml-px">px</span>
          </div>
        </SidebarHeader>

        <div className="mt-5 md:mt-4 px-1 md:w-full flex-1 flex justify-center mb-5 md:mb-0">
          <WidthSlider
            color={color}
            max={MAX_TEXT_SIZE}
            min={MIN_TEXT_SIZE}
            value={width}
            onChange={(width) => {
              app.texts.setStyle({ width });
            }}
            onChangeComplete={(width) => {
              app.texts.setStyle({ width });
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
              app.texts.setStyle({ outline });
            }}
          />
        </div>
      </SidebarSection>

      <SidebarSection>
        <SidebarHeader>
          <SidebarHeading>Text</SidebarHeading>
        </SidebarHeader>

        <div ref={textContainer} className="mt-3 w-56 md:w-full">
          <LabelTextareaField
            value={label}
            onChange={(label) => {
              app.texts.setStyle({ label });
            }}
            onChangeComplete={(label) => {
              app.texts.setStyle({ label });
            }}
          />
        </div>
      </SidebarSection>
    </>
  );
};