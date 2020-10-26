import React from "react";

import { icons } from "~/components/Icon";
import { pins } from "~/components/Pin";

type Props = {
  pinType: string;
  icon: string;
  color: string;
};

const allPins = pins();
const allIcons = icons();

export const PinPreview: React.FC<Props> = ({ pinType, icon, color }) => {
  const { component: Pin, dimensions, offset } = allPins[pinType];
  const Icon = allIcons[icon];
  const scale = 0.6;
  const iconSize = 32;

  return (
    <div className="relative">
      <div className="inset-0" style={{ width: dimensions[0] * scale, height: dimensions[1] * scale }}>
        <Pin className="w-full h-full" color={color} />
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
