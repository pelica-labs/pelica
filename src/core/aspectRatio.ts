import { CSSProperties } from "react";

import { ExpandIcon, FacebookIcon, FileIcon, Icon, InstagramIcon, SquareIcon, YouTubeIcon } from "~/components/ui/Icon";

export type AspectRatio = keyof typeof aspectRatios;

type Dimensions = {
  width: number;
  height: number;
};

export type AspectRatioConfiguration = {
  ratio?: [number, number];
  name: string;
  icon: Icon;
};

export const aspectRatios: { [key: string]: AspectRatioConfiguration } = {
  fill: {
    name: "Fill",
    icon: ExpandIcon,
  },
  square: {
    name: "Square",
    ratio: [2000, 2000],
    icon: SquareIcon,
  },
  facebookPost: {
    name: "Facebook post",
    ratio: [940, 788],
    icon: FacebookIcon,
  },
  facebookCover: {
    name: "Facebook cover",
    ratio: [2050, 780],
    icon: FacebookIcon,
  },
  instagramPost: {
    name: "Instagram post",
    ratio: [1080, 1080],
    icon: InstagramIcon,
  },
  instagramStory: {
    name: "Instagram story",
    ratio: [1080, 1920],
    icon: InstagramIcon,
  },
  youtubeThumbnail: {
    name: "YouTube thumbnail",
    ratio: [1280, 720],
    icon: YouTubeIcon,
  },
  a4: {
    name: "A4 print",
    ratio: [793.7, 1122.5],
    icon: FileIcon,
  },
};

export const computeResizingRatio = (aspectRatio: AspectRatio, screen: Dimensions): number => {
  const { ratio } = aspectRatios[aspectRatio];

  if (!ratio) {
    return 1;
  }

  const width = (ratio[0] / ratio[1]) * screen.height;
  const height = screen.height;

  const widthRatio = width / screen.width;
  const heightRatio = height / screen.height;

  return Math.max(widthRatio, heightRatio);
};

export const computeMapDimensions = (aspectRatio: AspectRatio, screen: Dimensions): CSSProperties => {
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

  const resizingRatio = computeResizingRatio(aspectRatio, screen);
  if (resizingRatio > 1) {
    width /= resizingRatio;
    height /= resizingRatio;
  }

  return {
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
  };
};
