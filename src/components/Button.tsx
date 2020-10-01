import classnames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  color?: string;
};

export const Button: React.FC<Props> = ({ active = false, color = "green", className, ...attributes }) => {
  const buttonClasses = classnames({
    "flex items-center py-1 px-2 rounded shadow": true,
    ...(className && {
      [className]: true,
    }),
    [`hover:bg-${color}-900`]: !active && !attributes.disabled,
    [`bg-${color}-700`]: active,
    ["opacity-50 cursor-auto"]: attributes.disabled,
  });

  return <button className={buttonClasses} {...attributes} />;
};
