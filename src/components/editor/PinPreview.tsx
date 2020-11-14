import React from "react";

import { pins } from "~/components/editor/Pin";
import { PinIcon } from "~/core/pins";
import { useIcon } from "~/hooks/useIcon";

type Props = {
  pinType: string | null;
  icon: PinIcon;
  color: string;
};

const allPins = pins();

export const PinPreview: React.FC<Props> = ({ pinType, icon, color }) => {
  const { component: Pin, dimensions, offset } = allPins[pinType || "none"];
  const Icon = useIcon(icon.collection, icon.name);
  const scale = 0.6;
  const iconSize = 32;

  return (
    <div className="relative">
      <div className="inset-0" style={{ width: dimensions[0] * scale, height: dimensions[1] * scale }}>
        {Pin && <Pin className="w-full h-full" color={color} />}
      </div>

      <div
        className="absolute inset-0"
        style={{
          width: iconSize * scale,
          height: iconSize * scale,
          top: offset * scale,
          left: Math.round(((dimensions[0] - iconSize) * scale) / 2),
        }}
      >
        <Icon className="w-full h-full" color={color} />
      </div>
    </div>
  );
};
