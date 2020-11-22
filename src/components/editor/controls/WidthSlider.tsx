import Slider from "rc-slider";
import React, { useEffect, useState } from "react";

import { useLayout } from "~/hooks/useLayout";
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
  const layout = useLayout();

  useEffect(() => {
    setWidth(value);
  }, [value]);

  return (
    <Slider
      handleStyle={{
        backgroundColor: color,
        borderColor: theme.colors.gray[200],
        height: layout.horizontal ? 14 : 18,
        width: layout.horizontal ? 14 : 18,
      }}
      max={max}
      min={min}
      railStyle={{
        height: layout.horizontal ? 4 : "100%",
        width: layout.horizontal ? "100%" : 8,
        backgroundColor: theme.colors.gray[400],
      }}
      trackStyle={{
        backgroundColor: color,
        height: layout.horizontal ? 4 : 0,
        width: layout.horizontal ? "100%" : 8,
      }}
      value={width}
      vertical={!layout.horizontal}
      onAfterChange={(value) => {
        onChangeComplete(value);
      }}
      onChange={(value) => {
        if (width < min || width > max) {
          return;
        }

        onChange(value);
        setWidth(value);
      }}
    />
  );
};