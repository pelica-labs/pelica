import React from "react";

import { Button } from "~/components/Button";
import { CheckboxIcon, EmptyCheckboxIcon } from "~/components/Icon";
import { SmartMatching, SmartMatchingProfile } from "~/lib/smartMatching";

type Props = {
  value: SmartMatching;
  onChange: (value: SmartMatching) => void;
};

export const SmartMatchingSelector: React.FC<Props> = ({ value, onChange }) => {
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

      {value.enabled && (
        <select
          className="ml-2 p-1 mt-2 md:mt-0 bg-gray-900 border border-gray-500 hover:border-orange-900 text-xs rounded cursor-pointer focus:outline-none"
          value={value.profile as string}
          onChange={(event) => {
            onChange({
              enabled: true,
              profile: event.target.value as SmartMatchingProfile,
            });
          }}
        >
          {["walking", "cycling", "driving"].map((profile) => {
            return (
              <option key={profile} value={profile}>
                {profile}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
};
