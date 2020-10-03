import React from "react";
import { TwitterPicker } from "react-color";

import { useStore } from "~/lib/state";
import { theme } from "~/lib/tailwind";

export const ColorPicker: React.FC = () => {
  const strokeColor = useStore((store) => store.editor.strokeColor);
  const dispatch = useStore((store) => store.dispatch);

  return (
    <TwitterPicker
      color={strokeColor}
      styles={{
        default: {
          card: { backgroundColor: theme.backgroundColor.gray[900], boxShadow: "none" },
          swatch: { width: 16, height: 16 },
          hash: { display: "none" },
          input: { display: "none" },
          body: { padding: 0, display: "flex", alignItems: "center", flexWrap: "wrap", marginLeft: 6 },
        },
      }}
      triangle={"hide"}
      width={"256"}
      onChangeComplete={(event) => {
        dispatch.setStrokeColor(event.hex);
      }}
    />
  );
};
