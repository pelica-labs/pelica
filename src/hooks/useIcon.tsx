import { pickBy } from "lodash";
import React from "react";
import { useEffect, useState } from "react";

import { iconFromDangerousSvgString, IconProps, icons } from "../components/Icon";

export interface IconCollection {
  icons: { [key: string]: { body: string; width?: number; height?: number } | React.FC<IconProps> };
  width: number;
  height: number;
}

const defaultIcons = icons();

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
