import Slider from "rc-slider";
import React, { useEffect, useState } from "react";

import { theme } from "~/styles/tailwind";

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

export const WidthSlider: React.FC<Props> = ({ min, max, value, onChange }) => {
  const [width, setWidth] = useState(value);

  useEffect(() => {
    setWidth(value);
  }, [value]);

  return (
    <Slider
      handleStyle={{
        backgroundColor: theme.colors.green[500],
        borderColor: theme.colors.gray[200],
        height: 14,
        width: 14,
      }}
      max={max}
      min={min}
      railStyle={{
        height: 4,
        backgroundColor: theme.colors.gray[200],
      }}
      trackStyle={{ backgroundColor: theme.colors.green[500], height: 4 }}
      value={width}
      onAfterChange={(value) => {
        onChange(value);
      }}
      onChange={(value) => {
        setWidth(value);
      }}
    />
  );
};
