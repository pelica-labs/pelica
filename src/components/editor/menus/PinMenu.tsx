import { Switch } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { ColorPicker } from "~/components/editor/controls/ColorPicker";
import { IconSelector } from "~/components/editor/controls/IconSelector";
import { PinSelector } from "~/components/editor/controls/PinSelector";
import { WidthSlider } from "~/components/editor/controls/WidthSlider";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { PinPreview } from "~/components/editor/PinPreview";
import { Heading } from "~/components/ui/Heading";
import { InformationIcon } from "~/components/ui/Icon";
import { Tooltip } from "~/components/ui/Tooltip";
import { app, useStore } from "~/core/app";
import { MAX_PIN_SIZE, MIN_PIN_SIZE } from "~/core/pins";

export const PinMenu: React.FC = () => {
  const color = useStore((store) => store.pins.style.color);
  const width = useStore((store) => store.pins.style.width);
  const icon = useStore((store) => store.pins.style.icon);
  const pinType = useStore((store) => store.pins.style.pinType);
  const clusterPoints = useStore((store) => store.pins.clusterPoints);

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
              app.pins.setStyle({ color });
            }}
            onChangeComplete={(color) => {
              app.pins.setStyle({ color });
            }}
          />
        </div>
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Size</Heading>
          <div className="ml-2 text-2xs text-gray-600 tracking-wide leading-none">{width}</div>
        </MenuSectionHeader>

        <div className="mt-5 md:mt-4 px-1 md:w-full flex-1 flex justify-center mb-5 md:mb-0">
          <WidthSlider
            color={color}
            max={MAX_PIN_SIZE}
            min={MIN_PIN_SIZE}
            value={width}
            onChange={(width) => {
              app.pins.setStyle({ width });
            }}
            onChangeComplete={(width) => {
              app.pins.setStyle({ width });
            }}
          />
        </div>
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Icon & pin</Heading>
        </MenuSectionHeader>

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
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Options</Heading>
        </MenuSectionHeader>

        <Switch.Group as="div" className="flex items-center mt-4 w-40 md:w-full">
          <Switch.Label className="flex items-center text-xs flex-1">Cluster points</Switch.Label>
          <Switch
            as="button"
            checked={clusterPoints}
            className={classNames(
              { "bg-orange-600": clusterPoints, "bg-gray-400": !clusterPoints },
              "relative inline-flex flex-shrink-0 h-4 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-7 focus:outline-none focus:ring"
            )}
            onChange={() => {
              app.pins.toggleCluster();
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
              <span className="w-64">
                When unzoomed, pins that are too close to each other will be regrouped to avoid cluttering the map.
              </span>
            }
          >
            <InformationIcon className="ml-2 w-3 h-3 cursor-pointer" />
          </Tooltip>
        </Switch.Group>
      </MenuSection>
    </>
  );
};
