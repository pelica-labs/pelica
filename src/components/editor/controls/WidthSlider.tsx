import Slider from "rc-slider";
import React, { useEffect, useState } from "react";
import tinycolor from "tinycolor2";

import { useLayout } from "~/hooks/useLayout";
import { theme } from "~/styles/tailwind";

type Props = {
  value: number;
  onChange: (value: number) => void;
  onChangeComplete: (value: number) => void;
  min: number;
  max: number;
  color: string;
  disabled?: boolean;
  step?: number;
};

const disableColor = (color: string): string => {
  return tinycolor(color).saturate(50).lighten(50).greyscale().toHexString();
};

export const WidthSlider: React.FC<Props> = ({
  value,
  onChange,
  onChangeComplete,
  min,
  max,
  color,
  step = 1,
  disabled = false,
}) => {
  const [width, setWidth] = useState(value);
  const layout = useLayout();

  useEffect(() => {
    setWidth(value);
  }, [value]);

  return (
    <Slider
      disabled={disabled}
      handleStyle={{
        backgroundColor: disabled ? disableColor(color) : color,
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
      step={step}
      style={{
        backgroundColor: "transparent",
      }}
      trackStyle={{
        backgroundColor: disabled ? disableColor(color) : color,
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
