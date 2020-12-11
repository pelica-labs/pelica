import { Switch } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { ColorPicker } from "~/components/editor/controls/ColorPicker";
import { SkyboxSelector } from "~/components/editor/controls/SkyboxSelector";
import { WidthSlider } from "~/components/editor/controls/WidthSlider";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { Heading } from "~/components/ui/Heading";
import { SkyboxMode } from "~/core/3d";
import { app, useStore } from "~/core/app";
import { useLayout } from "~/hooks/useLayout";
import { theme } from "~/styles/tailwind";

export const ThreeDMenu: React.FC = () => {
  const enabled = useStore((store) => store.threeD.enabled);
  const exageration = useStore((store) => store.threeD.exageration);
  const skyboxMode = useStore((store) => store.threeD.skyboxMode) as SkyboxMode;
  const skyColor = useStore((store) => store.threeD.skyColor);
  const layout = useLayout();

  return (
    <>
      <MenuSection>
        <MenuSectionHeader>
          <Heading>3D</Heading>
          {enabled && (
            <div className="ml-2 text-2xs text-gray-600 tracking-wide leading-none">({exageration}% scale)</div>
          )}
        </MenuSectionHeader>

        <div className="w-40 md:w-full">
          <Switch.Group as="div" className="flex items-center mt-4 w-40 md:w-full">
            <Switch.Label className="flex items-center text-xs flex-1">Enable 3D terrains</Switch.Label>
            <Switch
              as="button"
              checked={enabled}
              className={classNames(
                { "bg-orange-600": enabled, "bg-gray-400": !enabled },
                "relative inline-flex flex-shrink-0 h-4 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-7 focus:outline-none focus:ring"
              )}
              onChange={() => {
                app.threeD.toggle();
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
          </Switch.Group>
        </div>
        <div className="mt-5 md:mt-4 px-1 md:w-full flex-1 flex justify-center mb-5 md:mb-0">
          <WidthSlider
            color={theme.colors.gray[800]}
            disabled={!enabled}
            max={400}
            min={1}
            value={exageration}
            onChange={(exageration) => {
              app.threeD.setExageration(exageration);
            }}
            onChangeComplete={(exageration) => {
              app.threeD.setExageration(exageration);
            }}
          />
        </div>
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Sky</Heading>
          <div className="ml-2 w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: skyColor }} />
        </MenuSectionHeader>
        <div className="mt-4" style={{ marginLeft: layout.horizontal ? -4 : 0 }}>
          <SkyboxSelector
            value={skyboxMode}
            onChange={(skyboxMode) => {
              app.threeD.setSkybox(skyboxMode);
            }}
          />

          <div className="mt-4 px-1">
            <ColorPicker
              value={skyColor}
              onChange={(color) => {
                app.threeD.setSkyColor(color);
              }}
              onChangeComplete={(color) => {
                app.threeD.setSkyColor(color);
              }}
            />
          </div>
        </div>
      </MenuSection>
    </>
  );
};
