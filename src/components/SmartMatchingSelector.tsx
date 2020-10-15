import React, { useState } from "react";
import Popover from "react-popover";

import { Button } from "~/components/Button";
import {
  BicycleIcon,
  CarIcon,
  CheckboxIcon,
  EmptyCheckboxIcon,
  Icon,
  InformationIcon,
  WalkingIcon,
} from "~/components/Icon";
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
    <div className="flex flex-wrap items-center">
      <Button
        className="bg-gray-900 text-gray-200 mt-px"
        onClick={() => {
          onChange({
            enabled: !value.enabled,
            profile: value.enabled ? null : "driving",
          });
        }}
      >
        {value.enabled ? <CheckboxIcon className="w-3 h-3" /> : <EmptyCheckboxIcon className="w-3 h-3" />}
        <span className="ml-2 text-xs text-left">Smart matching</span>
      </Button>

      {!value.enabled && (
        <Popover
          body={
            <div className="bg-gray-900 rounded px-2 py-2 text-xs border border-orange-500 shadow text-gray-200 w-64 flex flex-col space-y-2">
              <span className="text-xs uppercase font-light tracking-wide leading-none border-b border-gray-700 pb-2 flex items-center">
                <InformationIcon className="w-3 h-3" />
                <span className="ml-1">Smart matching</span>
              </span>
              <span>Match your drawing to nearby roads.</span>
              <span className="text-gray-500">Works best when fully zoomed.</span>
              <img className="w-full mt-2 rounded-sm" src="/images/smart-matching-demo.gif" />
            </div>
          }
          className="z-50"
          enterExitTransitionDurationMs={200}
          isOpen={showTooltip}
          place="left"
          style={{ fill: theme.colors.orange[500] }}
          tipSize={4}
        >
          <InformationIcon
            className="ml-2 w-3 h-3 cursor-pointer"
            onMouseEnter={() => {
              setShowTooltip(true);
            }}
            onMouseLeave={() => {
              setShowTooltip(false);
            }}
          />
        </Popover>
      )}

      {value.enabled && (
        <div className="ml-2 flex items-center bg-gray-800 rounded">
          {Profiles.map((profileConfiguration) => {
            return (
              <div key={profileConfiguration.profile}>
                <Button
                  outlined
                  active={value.profile === profileConfiguration.profile}
                  className="text-gray-200"
                  shadow={false}
                  onClick={() => {
                    onChange({
                      enabled: true,
                      profile: profileConfiguration.profile,
                    });
                  }}
                >
                  <profileConfiguration.icon className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
