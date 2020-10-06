import React from "react";

import { Coordinates } from "~/lib/geometry";

type Props = {
  value: Coordinates;
  onChange: (value: Coordinates) => void;
  onChangeComplete: (value: Coordinates) => void;
};

export const CoordinatesInput: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  return (
    <div className="flex items-center">
      <label className="flex flex-col flex-1">
        <span className="text-2xs uppercase text-gray-500 font-light tracking-wide leading-none">Latitude</span>
        <input
          className="mt-1 text-2xs bg-transparent focus:outline-none appearance-none"
          max={90}
          min={-90}
          step={0.0001}
          type="number"
          value={value.latitude}
          onBlur={(event) => {
            onChangeComplete({
              latitude: parseFloat(event.target.value),
              longitude: value.longitude,
            });
          }}
          onChange={(event) => {
            onChange({
              latitude: parseFloat(event.target.value),
              longitude: value.longitude,
            });
          }}
        />
      </label>

      <label className="flex flex-col flex-1">
        <span className="text-2xs uppercase text-gray-500 font-light tracking-wide leading-none">Longitude</span>
        <input
          className="mt-1 text-2xs bg-transparent focus:outline-none appearance-none"
          max={180}
          min={-180}
          step={0.0001}
          type="number"
          value={value.longitude}
          onBlur={(event) => {
            onChangeComplete({
              latitude: value.latitude,
              longitude: parseFloat(event.target.value),
            });
          }}
          onChange={(event) => {
            onChange({
              latitude: value.latitude,
              longitude: parseFloat(event.target.value),
            });
          }}
        />
      </label>
    </div>
  );
};
