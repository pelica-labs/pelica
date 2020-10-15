import tinycolor from "tinycolor2";

import { OutlineType } from "~/core/routes";

export const outlineColor = (color: string, outline: OutlineType): string | null => {
  if (outline === "dark") {
    return tinycolor(color).darken(30).desaturate().toHexString();
  }

  if (outline === "light") {
    return tinycolor(color).lighten(30).desaturate().toHexString();
  }

  if (outline === "black") {
    return tinycolor("black").toHexString();
  }

  return null;
};
