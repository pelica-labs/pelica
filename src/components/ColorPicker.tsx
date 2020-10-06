import React, { useEffect, useRef, useState } from "react";
import { ChromePicker, TwitterPicker } from "react-color";

import { Button } from "~/components/Button";
import { PlusIcon } from "~/components/Icon";
import { useClickOutside } from "~/lib/clickOutside";
import { theme } from "~/styles/tailwind";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker: React.FC<Props> = ({ value, onChange }) => {
  const [color, setColor] = useState(value);
  const [showExtendedPicker, setShowExtendedPicker] = useState(false);

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
    <div className="relative flex items-start">
      <TwitterPicker
        color={color}
        styles={{
          default: {
            card: { backgroundColor: theme.colors.gray[900], boxShadow: "none" },
            swatch: { width: 14, height: 14 },
            hash: { display: "none" },
            input: { display: "none" },
            body: { padding: 0, display: "flex", alignItems: "center", flexWrap: "wrap", marginLeft: 6 },
          },
        }}
        triangle={"hide"}
        width={"256"}
        onChangeComplete={(event) => {
          onChange(event.hex);
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
        <div ref={extendedPickerRef} className="absolute z-10">
          <ChromePicker
            disableAlpha
            color={color}
            onChange={(event) => {
              setColor(event.hex);
            }}
            onChangeComplete={(event) => {
              onChange(event.hex);
            }}
          />
        </div>
      )}
    </div>
  );
};
