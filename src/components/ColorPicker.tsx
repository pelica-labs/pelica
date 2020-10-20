import React, { useEffect, useState } from "react";
import { ChromePicker, TwitterPicker } from "react-color";

import { Button } from "~/components/Button";
import { PlusIcon } from "~/components/Icon";
import { useStore } from "~/core/app";
import { useClickOutside } from "~/hooks/useClickOutside";
import { theme } from "~/styles/tailwind";

const defaultColors = [
  theme.colors.red[500],
  theme.colors.orange[500],
  theme.colors.yellow[500],
  theme.colors.green[500],
  theme.colors.teal[500],
  theme.colors.blue[500],
  theme.colors.indigo[500],
  theme.colors.purple[500],
  theme.colors.pink[500],
  theme.colors.gray[500],
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
};

export const ColorPicker: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  const [color, setColor] = useState(value);
  const [showExtendedPicker, setShowExtendedPicker] = useState(false);
  const screenDimensions = useStore((store) => store.screen.dimensions);

  const size = screenDimensions.md ? 14 : 20;

  const extendedPickerRef = useClickOutside<HTMLDivElement>(() => {
    if (showExtendedPicker) {
      setShowExtendedPicker(false);
    }
  });

  useEffect(() => {
    if (!showExtendedPicker) {
      return;
    }

    setColor(value);
  }, [showExtendedPicker]);

  return (
    <div className="relative flex items-start w-40 md:w-auto">
      <TwitterPicker
        color={color}
        colors={defaultColors}
        styles={{
          default: {
            card: { boxShadow: "none" },
            swatch: { width: size, height: size },
            hash: { display: "none" },
            input: { display: "none" },
            body: { padding: 0, display: "flex", alignItems: "center", flexWrap: "wrap", marginLeft: 6 },
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
        }}
      />

      <Button
        className="ml-1 py-px px-px"
        onClick={() => {
          setShowExtendedPicker(true);
        }}
      >
        <PlusIcon className="w-3 h-3" />
      </Button>

      {showExtendedPicker && (
        <div ref={extendedPickerRef} className="fixed md:absolute mb-2 md:mb-0 z-10 mt-6 bottom-0 md:right-0 mr-3">
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
