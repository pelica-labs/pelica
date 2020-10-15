import classnames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  color?: string;
  rounded?: boolean;
  outlined?: boolean;
  shadow?: boolean;
};

export const Button: React.FC<Props> = ({
  rounded = true,
  shadow = true,
  active = false,
  outlined = false,
  color = "orange",
  className,
  ...attributes
}) => {
  const buttonClasses = classnames({
    "flex items-center py-1 px-2 focus:outline-none": true,
    ...(className && {
      [className]: true,
    }),
    "rounded": rounded,
    "shadow": shadow,
    [`hover:bg-${color}-900`]: !active && !attributes.disabled,
    [`bg-${color}-700`]: !outlined && active,
    [`border border-${color}-700`]: outlined && active,
    "border border-transparent": outlined && !active,
    ["opacity-50 cursor-auto"]: attributes.disabled,
  });

  return <button className={buttonClasses} {...attributes} />;
};
