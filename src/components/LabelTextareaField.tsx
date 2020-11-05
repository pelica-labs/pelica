import React from "react";
import TextareaAutosize from "react-textarea-autosize";

import { PinIcon, WarningIcon } from "~/components/Icon";

type Props = {
  value: string;

  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
};

export const LabelTextareaField: React.FC<Props> = ({ value, onChange, onChangeComplete }) => {
  return (
    <div>
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

      {containsUnsupportedCharacter(value) && (
        <p className="mx-1 text-gray-600 flex space-x-1">
          <span className="text-2xs">
            <WarningIcon className="w-3 h-3 inline mr-1" />
            Special characters such as emoji or unicode aren't supported yet. You can use{" "}
            <PinIcon className="w-3 h-3 inline" /> pins for emojis.
          </span>
        </p>
      )}
    </div>
  );
};

const containsUnsupportedCharacter = (string: string) => {
  return /[\uD800-\uDFFF]/.test(string);
};
