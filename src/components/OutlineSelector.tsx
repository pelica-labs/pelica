import React from "react";

import { Button } from "~/components/Button";
import { OutlineType } from "~/core/routes";

type OutlineConfiguration = {
  name: string;
  outline: OutlineType;
};

const outlines: OutlineConfiguration[] = [
  { name: "Glow", outline: "glow" },
  { name: "Dark", outline: "dark" },
  { name: "Light", outline: "light" },
  { name: "Black", outline: "black" },
  { name: "None", outline: "none" },
];

type Props = {
  value: OutlineType;
  onChange: (value: OutlineType) => void;
};

export const OutlineSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap items-center">
      {outlines.map((configuration) => {
        return (
          <Button
            key={configuration.outline}
            outlined
            active={value === configuration.outline}
            className="text-xs"
            shadow={false}
            onClick={() => {
              onChange(configuration.outline);
            }}
          >
            {configuration.name}
          </Button>
        );
      })}
    </div>
  );
};
