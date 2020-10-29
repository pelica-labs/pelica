import React from "react";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  value: string;

  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
};

export const LabelTextareaField: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  return (
    <TextareaAutosize
      className="border rounded p-1 w-full text-xs"
      maxRows={8}
      minRows={3}
      value={value}
      onBlur={(event) => {
        onChangeComplete(event.target.value);
      }}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};