export type OutlineType = "dark" | "light" | "black" | "white" | "glow" | "none";

import tinycolor from "tinycolor2";

import { theme } from "~/styles/tailwind";

export type Color = keyof typeof theme.colors;

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

  if (outline === "white") {
    return tinycolor("white").toHexString();
  }

  if (outline === "glow") {
    return tinycolor(color).lighten(20).saturate().toHexString();
  }

  return color;
};
