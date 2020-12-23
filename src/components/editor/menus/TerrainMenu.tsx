import { Switch } from "@headlessui/react";
import classNames from "classnames";
import React from "react";

import { ColorPicker } from "~/components/editor/controls/ColorPicker";
import { SkyboxSelector } from "~/components/editor/controls/SkyboxSelector";
import { WidthSlider } from "~/components/editor/controls/WidthSlider";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { Heading } from "~/components/ui/Heading";
import { app, useStore } from "~/core/app";
import { SkyboxMode } from "~/core/terrain";
import { useLayout } from "~/hooks/useLayout";
import { theme } from "~/styles/tailwind";

export const TerrainMenu: React.FC = () => {
  const enabled = useStore((store) => store.terrain.enabled);
  const exageration = useStore((store) => store.terrain.exageration);
  const buildingsAvailable = useStore((store) => store.terrain.buildingsAvailable);
  const buildingsEnabled = useStore((store) => store.terrain.buildingsEnabled);
  const buildingsColor = useStore((store) => store.terrain.buildingsColor);
  const buildingsOpacity = useStore((store) => store.terrain.buildingsOpacity);
  const skyboxMode = useStore((store) => store.terrain.skyboxMode) as SkyboxMode;
  const layout = useLayout();

  return (
    <>
      <MenuSection>
        <MenuSectionHeader>
          <Heading>Terrain</Heading>
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
                app.terrain.toggle();
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
              app.terrain.setExageration(exageration);
            }}
            onChangeComplete={(exageration) => {
              app.terrain.setExageration(exageration);
            }}
          />
        </div>
      </MenuSection>

      <MenuSection className={classNames({ "opacity-50": !buildingsAvailable })}>
        <MenuSectionHeader>
          <Heading>Buildings</Heading>

          {!buildingsAvailable && (
            <div className="ml-2 text-2xs text-gray-600 tracking-wide leading-none">Unavailable for this style</div>
          )}
        </MenuSectionHeader>

        <div className="w-40 md:w-full">
          <Switch.Group as="div" className="flex items-center mt-4 w-40 md:w-full">
            <Switch.Label className="flex items-center text-xs flex-1">Enable 3D buildings</Switch.Label>
            <Switch
              as="button"
              checked={buildingsEnabled && buildingsAvailable}
              className={classNames({
                "relative inline-flex flex-shrink-0 h-4 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full w-7 focus:outline-none focus:ring": true,
                "bg-orange-600": buildingsEnabled && buildingsAvailable,
                "bg-gray-400": !buildingsEnabled || !buildingsAvailable,
                "cursor-pointer": buildingsAvailable,
                "cursor-not-allowed": !buildingsAvailable,
              })}
              disabled={!buildingsAvailable}
              onChange={() => {
                app.terrain.toggleBuildings();
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
        <div className="mt-4">
          <ColorPicker
            allowAlpha
            disabled={!buildingsAvailable}
            initialColors={[
              theme.colors.gray[300],
              theme.colors.gray[500],
              theme.colors.gray[700],
              theme.colors.gray[900],
              theme.colors.blue[900],
              theme.colors.orange[900],
              theme.colors.green[900],
              theme.colors.red[900],
            ]}
            opacity={buildingsOpacity}
            showRecentColors={false}
            value={buildingsColor}
            onAlphaChange={(opacity) => {
              app.terrain.setBuildingsOpacity(opacity);
            }}
            onAlphaChangeComplete={(opacity) => {
              app.terrain.setBuildingsOpacity(opacity);
            }}
            onChange={(color) => {
              app.terrain.setBuildingsColor(color);
            }}
            onChangeComplete={(color) => {
              app.terrain.setBuildingsColor(color);
            }}
          />
        </div>
      </MenuSection>

      <MenuSection>
        <MenuSectionHeader>
          <Heading>Sky</Heading>
        </MenuSectionHeader>
        <div className="mt-4" style={{ marginLeft: layout.horizontal ? -4 : 0 }}>
          <SkyboxSelector
            value={skyboxMode}
            onChange={(skyboxMode) => {
              app.terrain.setSkybox(skyboxMode);
            }}
          />
        </div>
      </MenuSection>
    </>
  );
};
