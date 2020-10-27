import { EmojiConvertor } from "emoji-js";
import { BaseEmoji, emojiIndex } from "emoji-mart";
import Fuse from "fuse.js";
import { capitalize, isEqual, snakeCase } from "lodash";
import React, { useState } from "react";

import { Button } from "~/components/Button";
import { iconFromDangerousSvgString, icons } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { PinIcon } from "~/core/pins";
import { useClickOutside } from "~/hooks/useClickOutside";
import { iconFromEmojiName, useIcon, useIconCollections } from "~/hooks/useIcon";

type Props = {
  value: PinIcon;
  onChange: (icon: PinIcon) => void;
  onChangeComplete: (icon: PinIcon) => void;
};

const defaultIcons = icons();

const emoji = new EmojiConvertor();
emoji.text_mode = true;

export const IconSelector: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  const [search, setSearch] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const container = useClickOutside<HTMLDivElement>(() => {
    setShowMenu(false);
  });

  const collections = useIconCollections();

  const fuse = new Fuse(
    Object.keys(collections).flatMap((collection) =>
      Object.keys(collections[collection].icons).map((name) => ({ collection, name }))
    ),
    { keys: ["collection", "name"] }
  );

  const SelectedIcon = useIcon(value.collection, value.name);

  const label = capitalize(
    snakeCase(emoji.replace_unified(value.name)).replace(/_/g, " ").replace(/-/g, " ").replace(/15/g, "")
  );

  return (
    <div ref={container} className="relative">
      <div>
        <Button
          className="mt-2"
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <div className="flex items-start">
            <SelectedIcon className="w-4 h-4" />
            {<span className="ml-2 text-gray-600 text-xs">{label}</span>}
          </div>
        </Button>
      </div>

      {showMenu && (
        <div className="fixed bottom-0 md:bottom-auto md:absolute left-0 right-0 md:right-auto md:top-0 mt-8 bg-white text-gray-800 md:rounded border flex flex-wrap pl-1 pb-1 shadow z-50 w-full md:w-40 xl:w-48">
          <input
            className="shadow appearance-none m-2 border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length < 2 ? (
            Object.entries(defaultIcons).map(([name, Icon]) => {
              const icon = { collection: "default", name };
              return (
                <SearchItem
                  key={`${icon.collection}-${icon.name}`}
                  Icon={Icon}
                  active={isEqual(icon, value)}
                  icon={icon}
                  setShowMenu={setShowMenu}
                  onChange={onChange}
                  onChangeComplete={onChangeComplete}
                />
              );
            })
          ) : (
            <>
              {fuse
                .search(search)
                .slice(0, 15)
                .map((result) => {
                  const collection = collections[result.item.collection];
                  const iconProps = collection.icons[result.item.name];
                  const icon = result.item;
                  const Icon =
                    "body" in iconProps
                      ? iconFromDangerousSvgString(
                          iconProps.body,
                          iconProps.width || collection.width,
                          iconProps.height || collection.height
                        )
                      : defaultIcons[result.item.name];
                  return (
                    <SearchItem
                      key={`${collection}-${icon.name}`}
                      Icon={Icon}
                      active={isEqual(icon, value)}
                      icon={icon}
                      setShowMenu={setShowMenu}
                      onChange={onChange}
                      onChangeComplete={onChangeComplete}
                    />
                  );
                })
                .concat(
                  (emojiIndex.search(search) || []).slice(0, 15).map((o) => {
                    const Icon = iconFromEmojiName((o as BaseEmoji).native, 32, 32);
                    const icon = { collection: "emoji", name: (o as BaseEmoji).native };
                    return (
                      <SearchItem
                        key={o.name}
                        Icon={Icon}
                        active={isEqual(icon, value)}
                        icon={icon}
                        setShowMenu={setShowMenu}
                        onChange={onChange}
                        onChangeComplete={onChangeComplete}
                      />
                    );
                  })
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface SearchItemProps {
  active: boolean;
  onChange: (icon: PinIcon) => void;
  onChangeComplete: (icon: PinIcon) => void;
  setShowMenu: (b: boolean) => void;
  Icon: React.FC<{ className?: string }>;
  icon: PinIcon;
}

const SearchItem = ({ active, onChange, onChangeComplete, setShowMenu, Icon, icon }: SearchItemProps) => {
  return (
    <div className="w-1/5 px-1 pt-1 flex justify-center">
      <IconButton
        active={active}
        onClick={() => {
          onChangeComplete(icon);
          setShowMenu(false);
        }}
        onMouseEnter={() => {
          onChange(icon);
        }}
      >
        <div className="flex items-center justify-center w-full">
          <Icon className="w-6 h-6 md:w-5 md:h-5 lg:w-4 lg:h-4" />
        </div>
      </IconButton>
    </div>
  );
};
