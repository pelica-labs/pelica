import Slider from "rc-slider";
import React, { useEffect, useState } from "react";

import { theme } from "~/styles/tailwind";

type Props = {
  value: number;
  onChange: (value: number) => void;
  onChangeComplete: (value: number) => void;
  min: number;
  max: number;
  color: string;
};

export const WidthSlider: React.FC<Props> = ({ value, onChange, onChangeComplete, min, max, color }) => {
  const [width, setWidth] = useState(value);

  useEffect(() => {
    setWidth(value);
  }, [value]);

  return (
    <Slider
      handleStyle={{
        backgroundColor: color,
        borderColor: theme.colors.gray[200],
        height: 14,
        width: 14,
      }}
      max={max}
      min={min}
      railStyle={{
        height: 4,
        backgroundColor: theme.colors.gray[400],
      }}
      trackStyle={{ backgroundColor: color, height: 4 }}
      value={width}
      onAfterChange={(value) => {
        onChangeComplete(value);
      }}
      onChange={(value) => {
        onChange(value);
        setWidth(value);
      }}
    />
  );
};
