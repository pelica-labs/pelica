import React from "react";

import { ColorPicker } from "~/components/editor/controls/ColorPicker";
import { OutlineSelector } from "~/components/editor/controls/OutlineSelector";
import { WidthSlider } from "~/components/editor/controls/WidthSlider";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { Distance } from "~/components/ui/Distance";
import { Heading } from "~/components/ui/Heading";
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
      <MenuSection>
        <MenuSectionHeader>
          <Heading>Color</Heading>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
        </MenuSectionHeader>

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
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Width</Heading>
          <div className="ml-2 flex justify-center items-center w-3 h-3 rounded-full">
            <div className="rounded-full" style={{ width: width, height: width, backgroundColor: color }} />
          </div>
        </MenuSectionHeader>

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
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Outline</Heading>
        </MenuSectionHeader>

        <div className="mt-4 w-40" style={{ marginLeft: screenDimensions.md ? -4 : 0 }}>
          <OutlineSelector
            value={outline}
            onChange={(outline) => {
              app.routes.setStyle({ outline });
            }}
          />
        </div>
      </MenuSection>

      {route && (
        <MenuSection className="md:mt-auto">
          <MenuSectionHeader>
            <Heading>Inspect</Heading>
          </MenuSectionHeader>
          <div className="mt-5 md:mt-4">
            <div className="flex items-center text-xs">
              <span className="mr-4">Distance</span>
              <Distance value={computeDistance(route)} />
            </div>
          </div>
        </MenuSection>
      )}
    </>
  );
};
