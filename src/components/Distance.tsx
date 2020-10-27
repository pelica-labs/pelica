import React from "react";

import { app, useStore } from "~/core/app";
import { Units } from "~/core/units";

type Props = {
  value: number;
};

export const Distance: React.FC<Props> = ({ value }) => {
  const unit = useStore((store) => store.units.distance);

  const convertedValue = unit === "imperial" ? value / 1.60934 : value;

  return (
    <div
      className="flex cursor-pointer"
      onClick={() => {
        app.units.toggleDistanceUnit();
      }}
    >
      <span className="mr-px">{convertedValue.toFixed(2)}</span>
      <span className="ml-px text-gray-600">{unit === "metric" ? "km" : "mi"}</span>
    </div>
  );
};

export const formatDistance = (distance: number, unit: Units["distance"]): string => {
  const convertedValue = (unit === "imperial" ? distance / 1.60934 : distance).toFixed(2);
  const formattedUnit = unit === "metric" ? "km" : "mi";

  return `${convertedValue} ${formattedUnit}`;
};
