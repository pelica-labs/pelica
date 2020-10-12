import tinycolor from "tinycolor2";

export const outlineColor = (color: string): string => {
  return tinycolor(color).darken(30).desaturate().toHexString();
};
