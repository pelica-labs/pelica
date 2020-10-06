import React from "react";
import { TwitterPicker } from "react-color";

import { theme } from "~/styles/tailwind";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker: React.FC<Props> = ({ value, onChange }) => {
  return (
    <TwitterPicker
      color={value}
      styles={{
        default: {
          card: { backgroundColor: theme.colors.gray[900], boxShadow: "none" },
          swatch: { width: 16, height: 16 },
          hash: { display: "none" },
          input: { display: "none" },
          body: { padding: 0, display: "flex", alignItems: "center", flexWrap: "wrap", marginLeft: 6 },
        },
      }}
      triangle={"hide"}
      width={"256"}
      onChangeComplete={(event) => {
        onChange(event.hex);
      }}
    />
  );
};
