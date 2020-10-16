import React from "react";

import { useApp, useStore } from "~/core/app";

type Props = {
  value: number;
};

export const Distance: React.FC<Props> = ({ value }) => {
  const app = useApp();
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
