import { CSSProperties } from "react";

import { ScreenDimensions } from "~/lib/screen";

export type AspectRatio = keyof typeof aspectRatios;

type AspectRatioConfiguration = {
  ratio?: [number, number];
  name: string;
};

export const aspectRatios: { [key: string]: AspectRatioConfiguration } = {
  fill: {
    name: "Fill",
  },
  square: {
    name: "Square",
    ratio: [1, 1],
  },
  facebookPost: {
    name: "Facebook post",
    ratio: [940, 788],
  },
  facebookCover: {
    name: "Facebook cover",
    ratio: [2050, 780],
  },
  instagramPost: {
    name: "Instagram post",
    ratio: [1080, 1080],
  },
  instagramStory: {
    name: "Instagram story",
    ratio: [1080, 1920],
  },
  youtubeThumbnail: {
    name: "YouTube thumbnail",
    ratio: [1280, 720],
  },
  a4: {
    name: "A4 print",
    ratio: [793.7, 1122.5],
  },
};

export function computeMapDimensions(aspectRatio: AspectRatio, screen: ScreenDimensions): CSSProperties {
  const { ratio } = aspectRatios[aspectRatio];

  if (!ratio) {
    return {
      width: "100%",
      height: "100%",
      maxHeight: "none",
      maxWidth: "none",
    };
  }

  let width = (ratio[0] / ratio[1]) * screen.height;
  let height = screen.height;

  const widthRatio = width / screen.width;
  const heightRatio = height / screen.height;
  const highestRatio = Math.max(widthRatio, heightRatio);

  if (highestRatio > 1) {
    width /= highestRatio;
    height /= highestRatio;
  }

  return {
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
  };
}
