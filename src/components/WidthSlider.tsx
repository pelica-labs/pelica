import Slider from "rc-slider";
import React from "react";

import { theme } from "~/styles/tailwind";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export const WidthSlider: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Slider
      handleStyle={{
        backgroundColor: theme.colors.green[500],
        borderColor: theme.colors.gray[200],
        height: 14,
        width: 14,
      }}
      max={12}
      min={1}
      railStyle={{
        height: 4,
        backgroundColor: theme.colors.gray[200],
      }}
      trackStyle={{ backgroundColor: theme.colors.green[500], height: 4 }}
      value={value}
      onChange={(value) => {
        onChange(value);
      }}
    />
  );
};
