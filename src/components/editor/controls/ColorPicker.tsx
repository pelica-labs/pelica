import { orderBy, throttle, uniq } from "lodash";
import { MapMouseEvent } from "mapbox-gl";
import React, { useEffect, useState } from "react";
import { ChromePicker, TwitterPicker } from "react-color";
import tinycolor from "tinycolor2";

import { Button } from "~/components/ui/Button";
import { PipetteIcon, PlusIcon, TrashIcon } from "~/components/ui/Icon";
import { Tooltip } from "~/components/ui/Tooltip";
import { getMap } from "~/core/selectors";
import { useAsyncStorage } from "~/hooks/useAsyncStorage";
import { useClickOutside } from "~/hooks/useClickOutside";
import { useLayout } from "~/hooks/useLayout";
import { dataUrlToImageData } from "~/lib/fileConversion";
import { theme } from "~/styles/tailwind";

const MAX_COLORS = 21;

const SAMPLE_SIZE = 200;

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
  const [isSamplingColor, setIsSamplingColor] = useState(false);
  const [colorSample, setColorSample] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isSamplingColor) {
      setColorSample(null);
      return;
    }

    const map = getMap();
    const canvas3d = map.getCanvas();
    const context3d = canvas3d.getContext("webgl") as WebGLRenderingContext;

    const canvas = document.createElement("canvas");
    canvas.width = context3d.drawingBufferWidth;
    canvas.height = context3d.drawingBufferHeight;
    const context = canvas.getContext("2d");

    dataUrlToImageData(map.getCanvas().toDataURL()).then((imageData) => {
      context?.putImageData(imageData, 0, 0);
    });

    const getColor = (x: number, y: number): string | null => {
      console.log(x, y);
      const sample = context?.getImageData(x - SAMPLE_SIZE / 2, y - SAMPLE_SIZE / 2, SAMPLE_SIZE, SAMPLE_SIZE);
      if (sample) {
        const sampleCanvas = document.createElement("canvas");
        const sampleContext = sampleCanvas.getContext("2d");
        sampleCanvas.width = SAMPLE_SIZE;
        sampleCanvas.height = SAMPLE_SIZE;
        sampleContext?.putImageData(sample, 0, 0);

        setColorSample(sampleCanvas.toDataURL());
      }

      const pixel = context?.getImageData(x, y, 1, 1);
      if (!pixel) {
        return null;
      }

      const color = `rgba(${pixel.data[0]}, ${pixel.data[1]}, ${pixel.data[2]}, ${pixel.data[3]})`;

      return tinycolor(color).toHexString();
    };

    const onMouseMove = throttle((event: MapMouseEvent) => {
      const color = getColor(event.point.x, event.point.y);

      if (color) {
        setColor(color);
        onChange(color);
        onAlphaChange?.(1);
      }
    }, 200);

    const onMouseClick = (event: MapMouseEvent) => {
      event.preventDefault();
      event.originalEvent.preventDefault();
      event.originalEvent.stopPropagation();

      const color = getColor(event.point.x, event.point.y);

      if (color) {
        onChangeComplete(color);
        onAlphaChangeComplete?.(1);
        setIsSamplingColor(false);
      }
    };

    map.on("mousemove", onMouseMove);
    map.once("click", onMouseClick);

    return () => {
      map.off("mousemove", onMouseMove);
      map.off("click", onMouseClick);
    };
  }, [isSamplingColor]);

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
        <div className="flex flex-col space-y-1 ml-1">
          <Button
            className="py-px px-px"
            disabled={disabled}
            onClick={() => {
              setShowExtendedPicker(true);
            }}
          >
            <PlusIcon className="w-4 h-4 md:w-3 md:h-3" />
          </Button>

          <Tooltip placement="left" text="Copy a color from the map">
            <Button
              active={isSamplingColor}
              className="py-px px-px"
              disabled={disabled}
              onClick={() => {
                setIsSamplingColor(!isSamplingColor);
              }}
            >
              <PipetteIcon className="w-4 h-4 md:w-3 md:h-3" />
            </Button>
          </Tooltip>
        </div>

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

      {isSamplingColor && (
        <div
          className="fixed md:absolute mb-2 md:mb-0 z-10 mt-6 bottom-0 md:bottom-auto md:right-0 mr-3 bg-white shadow-2xl border border-gray-500 flex justify-center items-center"
          style={{ width: SAMPLE_SIZE, height: SAMPLE_SIZE }}
        >
          {!colorSample && (
            <div className="p-4 flex flex-col space-y-4 items-center">
              <PipetteIcon className="w-6 h-6" />
              <span className="text-xs">Move your cursor on the map to sample a color.</span>
            </div>
          )}

          {colorSample && (
            <div className="relative">
              <img className="w-full h-full" src={colorSample} />
              <div
                className="absolute top-0 left-0 bg-gray-200 bg-opacity-50"
                style={{ marginLeft: SAMPLE_SIZE / 2, width: 2, height: "calc(50% - 2px)" }}
              />
              <div
                className="absolute top-0 left-0 bg-gray-200 bg-opacity-50"
                style={{
                  marginLeft: SAMPLE_SIZE / 2,
                  marginTop: SAMPLE_SIZE / 2 + 4,
                  width: 2,
                  height: "calc(50% - 2px)",
                }}
              />
              <div
                className="absolute top-0 left-0 bg-gray-200 bg-opacity-50"
                style={{
                  marginTop: SAMPLE_SIZE / 2,
                  marginLeft: SAMPLE_SIZE / 2 + 4,
                  height: 2,
                  width: "calc(50% - 2px)",
                }}
              />
              <div
                className="absolute top-0 left-0 bg-gray-200 bg-opacity-50"
                style={{ marginTop: SAMPLE_SIZE / 2, height: 2, width: "calc(50% - 2px)" }}
              />
              <div className="absolute bottom-0 w-full flex justify-center mb-2 text-xs">
                <div className="bg-gray-900 text-white bg-opacity-75 rounded-lg px-1 py-px flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                  <span>{color.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
