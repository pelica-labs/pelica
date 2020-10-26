import { orderBy, uniq } from "lodash";
import React, { useEffect, useState } from "react";
import { ChromePicker, TwitterPicker } from "react-color";
import tinycolor from "tinycolor2";

import { Button } from "~/components/Button";
import { PlusIcon, TrashIcon } from "~/components/Icon";
import { Tooltip } from "~/components/Tooltip";
import { useStore } from "~/core/app";
import { useAsyncStorage } from "~/hooks/useAsyncStorage";
import { useClickOutside } from "~/hooks/useClickOutside";
import { theme } from "~/styles/tailwind";

const MAX_COLORS = 21;

const defaultColors = [
  theme.colors.red[600],
  theme.colors.orange[500],
  theme.colors.yellow[500],
  theme.colors.green[500],
  theme.colors.teal[500],
  theme.colors.blue[300],
  theme.colors.blue[700],
  theme.colors.indigo[500],
  theme.colors.purple[500],
  theme.colors.pink[500],
  theme.colors.gray[200],
  theme.colors.gray[400],
  theme.colors.gray[700],
  theme.colors.black,
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
};

export const ColorPicker: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  const [color, setColor] = useState(value);
  const [showExtendedPicker, setShowExtendedPicker] = useState(false);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const [recentColors, setRecentColors] = useAsyncStorage<string[]>(`recentColors`, []);

  const size = screenDimensions.lg ? 20 : 26;

  const extendedPickerRef = useClickOutside<HTMLDivElement>(() => {
    if (showExtendedPicker) {
      setShowExtendedPicker(false);
    }
  });

  useEffect(() => {
    if (!showExtendedPicker) {
      setRecentColors(uniq([color, ...recentColors]));
      return;
    }

    setColor(value);
  }, [showExtendedPicker]);

  const orderedRecentColors = orderBy(recentColors.slice(0, MAX_COLORS - defaultColors.length), (color) => {
    return tinycolor(color).toHsl().h;
  });

  const colors = uniq([...defaultColors, ...orderedRecentColors]);

  return (
    <div className="relative flex items-start w-64 md:w-auto h-full">
      <TwitterPicker
        color={color}
        colors={colors}
        styles={{
          default: {
            card: { boxShadow: "none", height: "100%" },
            swatch: { width: size, height: size },
            hash: { display: "none" },
            input: { display: "none" },
            body: {
              padding: 0,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              marginLeft: 6,
              height: "100%",
            },
          },
        }}
        triangle={"hide"}
        width={"256"}
        onChange={(event) => {
          setColor(event.hex);
          onChange(event.hex);
        }}
        onChangeComplete={(event) => {
          onChangeComplete(event.hex);

          setRecentColors(uniq([event.hex, ...recentColors]));
        }}
      />

      <div className="flex flex-col h-full justify-between pb-2">
        <Button
          className="ml-1 py-px px-px"
          onClick={() => {
            setShowExtendedPicker(true);
          }}
        >
          <PlusIcon className="w-4 h-4 md:w-3 md:h-3" />
        </Button>

        <Tooltip placement="left" text="Clear recently used colors">
          <Button
            className="ml-1 py-px px-px"
            onClick={() => {
              setRecentColors([]);
            }}
          >
            <TrashIcon className="w-4 h-4 md:w-3 md:h-3" />
          </Button>
        </Tooltip>
      </div>

      {showExtendedPicker && (
        <div
          ref={extendedPickerRef}
          className="fixed md:absolute mb-2 md:mb-0 z-10 mt-6 bottom-0 md:bottom-auto md:right-0 mr-3"
        >
          <ChromePicker
            disableAlpha
            color={color}
            onChange={(event) => {
              setColor(event.hex);
              onChange(event.hex);
            }}
            onChangeComplete={(event) => {
              onChangeComplete(event.hex);
            }}
          />
        </div>
      )}
    </div>
  );
};
