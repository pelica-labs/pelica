import makiCollection from "@iconify/json/json/maki.json";
import mapCollection from "@iconify/json/json/map.json";
import { pickBy } from "lodash";

import { iconFromDangerousSvgString, IconProps, icons } from "../components/Icon";

export interface IconCollection {
  icons: { [key: string]: { body: string; width?: number; height?: number } | React.FC<IconProps> };
  width: number;
  height: number;
}

const defaultIcons = icons();

export const collections: { [key: string]: IconCollection } = {
  maki: { ...makiCollection, icons: pickBy(makiCollection.icons, (value, key) => key.endsWith("15")) },
  map: mapCollection,
  default: { icons: defaultIcons, width: 24, height: 24 },
};

export const findIcon = (collection: string, name: string): React.FC<IconProps> => {
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
  return findIcon(collection, name);
};

export const useIconCollections = (): { [key: string]: IconCollection } => {
  return collections;
};
