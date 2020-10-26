import React from "react";

type Props = {
  value: string;

  onChange: (value: string) => void;
};

export const PinLabelField: React.FC<Props> = ({ value, onChange }) => {
  return (
    <textarea
      className="border rounded p-1 w-full text-xs"
      placeholder="Add text to your pin"
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};
