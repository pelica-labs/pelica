import { orderBy, uniq } from "lodash";
import React, { useEffect, useState } from "react";
import { ChromePicker, TwitterPicker } from "react-color";
import tinycolor from "tinycolor2";

import { Button } from "~/components/ui/Button";
import { PlusIcon, TrashIcon } from "~/components/ui/Icon";
import { Tooltip } from "~/components/ui/Tooltip";
import { useAsyncStorage } from "~/hooks/useAsyncStorage";
import { useClickOutside } from "~/hooks/useClickOutside";
import { useLayout } from "~/hooks/useLayout";
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

  opacity?: number;
  onAlphaChange?: (value: number) => void;
  onAlphaChangeComplete?: (value: number) => void;

  disabled?: boolean;
  allowAlpha?: boolean;
  showRecentColors?: boolean;
  initialColors?: string[];
};

export const ColorPicker: React.FC<Props> = ({
  value,
  onChange,
  onChangeComplete,
  opacity = 1,
  onAlphaChange,
  onAlphaChangeComplete,
  disabled = false,
  allowAlpha = false,
  showRecentColors = true,
  initialColors = defaultColors,
}) => {
  const [color, setColor] = useState(value);
  const [alpha, setAlpha] = useState(opacity);
  const [showExtendedPicker, setShowExtendedPicker] = useState(false);
  const layout = useLayout();
  const [recentColors, setRecentColors] = useAsyncStorage<string[]>(`recentColors`, []);

  const size = layout.horizontal ? 18 : 26;

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

  const orderedRecentColors = orderBy(recentColors.slice(0, MAX_COLORS - initialColors.length), (color) => {
    return tinycolor(color).toHsl().h;
  });

  return (
    <div className="relative flex items-start w-64 md:w-auto h-full">
      <div className="flex flex-col">
        <TwitterPicker
          color={color}
          colors={initialColors}
          styles={{
            default: {
              card: { boxShadow: "none", height: "100%", marginBottom: 2 },
              swatch: { width: size, height: size, cursor: disabled ? "not-allowed" : "pointer" },
              hash: { display: "none" },
              input: { display: "none" },
              body: {
                padding: 0,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                height: "100%",
              },
            },
          }}
          triangle={"hide"}
          width={"256"}
          onChange={(event) => {
            setColor(event.hex);
            onChange(event.hex);

            setAlpha(1);
            onAlphaChange?.(1);
          }}
          onChangeComplete={(event) => {
            onChangeComplete(event.hex);

            setAlpha(1);
            onAlphaChangeComplete?.(1);
          }}
        />
        {showRecentColors && orderedRecentColors.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <TwitterPicker
              color={color}
              colors={orderedRecentColors}
              styles={{
                default: {
                  card: { boxShadow: "none", height: "100%" },
                  swatch: { width: size, height: size, cursor: disabled ? "not-allowed" : "pointer" },
                  hash: { display: "none" },
                  input: { display: "none" },
                  body: {
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    height: "100%",
                  },
                },
              }}
              triangle={"hide"}
              width={"256"}
              onChange={(event) => {
                setColor(event.hex);
                onChange(event.hex);

                setAlpha(1);
                onAlphaChange?.(1);
              }}
              onChangeComplete={(event) => {
                onChangeComplete(event.hex);

                setRecentColors(uniq([event.hex, ...recentColors]));

                setAlpha(1);
                onAlphaChangeComplete?.(1);
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col h-full justify-between pb-2">
        <Button
          className="ml-1 py-px px-px"
          disabled={disabled}
          onClick={() => {
            setShowExtendedPicker(true);
          }}
        >
          <PlusIcon className="w-4 h-4 md:w-3 md:h-3" />
        </Button>

        {showRecentColors && recentColors.length > 0 && (
          <Tooltip placement="left" text="Clear recently used colors">
            <Button
              className="ml-1 py-px px-px"
              disabled={disabled}
              onClick={() => {
                setRecentColors([]);
              }}
            >
              <TrashIcon className="w-4 h-4 md:w-3 md:h-3" />
            </Button>
          </Tooltip>
        )}
      </div>

      {showExtendedPicker && (
        <div
          ref={extendedPickerRef}
          className="fixed md:absolute mb-2 md:mb-0 z-10 mt-6 bottom-0 md:bottom-auto md:right-0 mr-3"
        >
          <ChromePicker
            color={tinycolor(color).setAlpha(alpha).toHslString()}
            disableAlpha={!allowAlpha}
            onChange={(event) => {
              setColor(event.hex);
              onChange(event.hex);

              if (event.rgb.a) {
                setAlpha(event.rgb.a);
                onAlphaChange?.(event.rgb.a);
              }
            }}
            onChangeComplete={(event) => {
              onChangeComplete(event.hex);

              if (event.rgb.a) {
                setAlpha(event.rgb.a);
                onAlphaChangeComplete?.(event.rgb.a);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
