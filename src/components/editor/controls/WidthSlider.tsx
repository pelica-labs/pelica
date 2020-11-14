import Slider from "rc-slider";
import React, { useEffect, useState } from "react";

import { useStore } from "~/core/app";
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
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

  useEffect(() => {
    setWidth(value);
  }, [value]);

  return (
    <Slider
      handleStyle={{
        backgroundColor: color,
        borderColor: theme.colors.gray[200],
        height: screenDimensions.md ? 14 : 18,
        width: screenDimensions.md ? 14 : 18,
      }}
      max={max}
      min={min}
      railStyle={{
        height: screenDimensions.md ? 4 : "100%",
        width: screenDimensions.md ? "100%" : 8,
        backgroundColor: theme.colors.gray[400],
      }}
      trackStyle={{
        backgroundColor: color,
        height: screenDimensions.md ? 4 : 0,
        width: screenDimensions.md ? "100%" : 8,
      }}
      value={width}
      vertical={!screenDimensions.md}
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
