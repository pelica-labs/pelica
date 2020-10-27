import { EmojiConvertor } from "emoji-js";
import { pickBy } from "lodash";
import React from "react";
import { useEffect, useState } from "react";

import { Icon, iconFromDangerousSvgString, iconFromImgUrl, IconProps, icons } from "../components/Icon";

export interface IconCollection {
  icons: { [key: string]: { body: string; width?: number; height?: number } | React.FC<IconProps> };
  width: number;
  height: number;
}

const defaultIcons = icons();

export const emoji = new EmojiConvertor();
emoji.replace_mode = "img";
emoji.img_sets.apple.path = "/emoji-data/64/";

export const getCollections = async (): Promise<{ [key: string]: IconCollection }> => {
  const maki = (await import("@iconify/json/json/maki.json")).default;
  const map = (await import("@iconify/json/json/map.json")).default;
  return {
    maki: { ...maki, icons: pickBy(maki.icons, (value, key) => key.endsWith("15")) },
    map,
    default: { icons: defaultIcons, width: 24, height: 24 },
  };
};

export const findIcon = async (collection: string, name: string): Promise<React.FC<IconProps>> => {
  const collections = await getCollections();
  try {
    if (collection === "default" && defaultIcons[name]) {
      return defaultIcons[name];
    } else if (collection === "emoji") {
      const imgEl = emoji.replace_unified(name);
      const imgSrc = imgEl.slice(imgEl.indexOf("(") + 1, imgEl.indexOf(")"));
      return iconFromImgUrl(imgSrc, 32, 32);
    } else {
      const icon = collections[collection].icons[name] as { body: string; width?: number; height?: number };
      return iconFromDangerousSvgString(
        icon.body,
        icon.width || collections[collection].width,
        icon.height || collections[collection].height
      );
    }
  } catch (error) {
    return () => null;
  }
};

export const useIcon = (collection: string, name: string): React.FC<IconProps> => {
  const [icon, setIcon] = useState<React.FC<IconProps>>(() => () => null);

  useEffect(() => {
    findIcon(collection, name).then((i) => setIcon(() => i));
  }, [collection, name]);

  return icon;
};

export const useIconCollections = (): { [key: string]: IconCollection } => {
  const [collections, setCollections] = useState<{ [key: string]: IconCollection }>({
    default: { icons: defaultIcons, width: 24, height: 24 },
  });

  useEffect(() => {
    getCollections().then((c) => setCollections(c));
  }, []);

  return collections;
};

export const iconFromEmojiName = (name: string, width: number, height: number): Icon => {
  return iconFromImgUrl(imgSrcFromEmojiName(name), width, height);
};

export const imgSrcFromEmojiName = (name: string): string => {
  const imgEl = emoji.replace_unified(name);
  return imgEl.slice(imgEl.indexOf("(") + 1, imgEl.indexOf(")"));
};
