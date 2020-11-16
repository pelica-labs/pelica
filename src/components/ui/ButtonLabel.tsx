import React, { HTMLProps } from "react";

type Props = HTMLProps<HTMLSpanElement> & {
  label: string;
  hotkey?: string;
};

export const ButtonLabel: React.FC<Props> = ({ label, hotkey, ...props }) => {
  const hotkeyPosition = hotkey ? label.indexOf(hotkey) : 0;

  return (
    <span {...props}>
      {hotkeyPosition === -1 && label}
      {hotkeyPosition >= 0 && (
        <>
          <span>{label.slice(0, hotkeyPosition)}</span>
          <span className="group-hover:font-medium group-hover:underline tracking-tight">
            {label.slice(hotkeyPosition, hotkeyPosition + 1)}
          </span>
          <span>{label.slice(hotkeyPosition + 1)}</span>
        </>
      )}
    </span>
  );
};
