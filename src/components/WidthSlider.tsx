import Slider from "rc-slider";
import React from "react";

import { useStore } from "~/lib/state";
import { theme } from "~/styles/tailwind";

export const WidthSlider: React.FC = () => {
  const strokeWidth = useStore((store) => store.editor.strokeWidth);
  const dispatch = useStore((store) => store.dispatch);

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
      value={strokeWidth}
      onChange={(value) => {
        dispatch.setStrokeWidth(value);
      }}
    />
  );
};
