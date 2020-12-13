import React from "react";

import { Button } from "~/components/ui/Button";
import { SkyboxMode } from "~/core/terrain";

type SkyboxConfiguration = {
  name: string;
  mode: SkyboxMode;
};

const skyboxes: SkyboxConfiguration[] = [
  { name: "Day", mode: "day" },
  { name: "Sunset", mode: "sunset" },
  { name: "Night", mode: "night" },
  { name: "Sunrise", mode: "sunrise" },
];

type Props = {
  value: SkyboxMode;
  onChange: (value: SkyboxMode) => void;
};

export const SkyboxSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap items-center">
      {skyboxes.map((configuration) => {
        return (
          <Button
            key={configuration.mode}
            outlined
            active={value === configuration.mode}
            className="text-xs"
            shadow={false}
            onClick={() => {
              onChange(configuration.mode);
            }}
          >
            {configuration.name}
          </Button>
        );
      })}
    </div>
  );
};
