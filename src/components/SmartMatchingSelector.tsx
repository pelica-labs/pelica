import { Switch } from "@headlessui/react";
import classNames from "classnames";
import React, { useState } from "react";
import Popover from "react-popover";

import { BicycleIcon, CarIcon, Icon, InformationIcon, WalkingIcon } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";
import { theme } from "~/styles/tailwind";

type Props = {
  value: SmartMatching;
  onChange: (value: SmartMatching) => void;
};

type ProfileConfiguration = {
  name: string;
  icon: Icon;
  profile: SmartMatchingProfile;
};

const Profiles: ProfileConfiguration[] = [
  { name: "Driving", icon: CarIcon, profile: "driving" },
  { name: "Cycling", icon: BicycleIcon, profile: "cycling" },
  { name: "Walking", icon: WalkingIcon, profile: "walking" },
];

export const SmartMatchingSelector: React.FC<Props> = ({ value, onChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="text-xs">
      <div className="w-full flex items-center">
        <Switch.Group as="div" className="flex items-center space-x-4">
          <Switch.Label>Smart matching</Switch.Label>
          <Switch
            as="button"
            checked={value.enabled}
            className={classNames(
              { "bg-orange-600": value.enabled, "bg-gray-400": !value.enabled },
              "relative inline-flex flex-shrink-0 h-4 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-7 focus:outline-none focus:shadow-outline"
            )}
            onChange={() => {
              onChange({
                enabled: !value.enabled,
                profile: value.enabled ? null : "driving",
              });
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
        <Popover
          body={
            <div className="bg-white rounded px-2 py-2 text-xs border shadow text-gray-800 w-64 flex flex-col space-y-2">
              <span className="text-xs uppercase font-light tracking-wide leading-none border-b border-gray-500 pb-2 flex items-center">
                <InformationIcon className="w-3 h-3" />
                <span className="ml-1">Smart matching</span>
              </span>
              <span>Match your drawing to nearby roads.</span>
              <span className="text-gray-600">Works best when fully zoomed.</span>
              <img className="w-full mt-2 rounded-sm" src="/images/smart-matching-demo.gif" />
            </div>
          }
          className="z-50"
          enterExitTransitionDurationMs={200}
          isOpen={showTooltip}
          place="left"
          style={{ fill: theme.colors.orange[500] }}
          tipSize={4}
          onOuterAction={() => setShowTooltip(false)}
        >
          <InformationIcon
            className="ml-2 w-3 h-3 cursor-pointer"
            onClick={() => {
              setShowTooltip(!showTooltip);
            }}
          />
        </Popover>
      </div>

      {value.enabled && (
        <div className="mt-2 inline-flex items-center gap-2 rounded border">
          {Profiles.map((profileConfiguration) => {
            return (
              <div key={profileConfiguration.profile}>
                <IconButton
                  active={value.profile === profileConfiguration.profile}
                  className="text-gray-800"
                  onClick={() => {
                    onChange({
                      enabled: true,
                      profile: profileConfiguration.profile,
                    });
                  }}
                >
                  <profileConfiguration.icon className="w-6 h-6" />
                </IconButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
