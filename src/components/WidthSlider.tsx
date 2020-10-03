import Slider from "rc-slider";
import React from "react";

import { useStore } from "~/lib/state";
import { theme } from "~/lib/tailwind";

export const WidthSlider: React.FC = () => {
  const strokeWidth = useStore((store) => store.editor.strokeWidth);
  const dispatch = useStore((store) => store.dispatch);

  return (
    <Slider
      handleStyle={{
        backgroundColor: theme.backgroundColor.green[500],
        borderColor: theme.backgroundColor.gray[200],
        height: 14,
        width: 14,
      }}
      max={10}
      min={1}
      railStyle={{
        height: 4,
        backgroundColor: theme.backgroundColor.gray[200],
      }}
      trackStyle={{ backgroundColor: theme.backgroundColor.green[500], height: 4 }}
      value={strokeWidth}
      onChange={(value) => {
        dispatch.setStrokeWidth(value);
      }}
    />
  );
};
