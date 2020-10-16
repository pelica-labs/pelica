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
    "flex items-center py-1 px-2 focus:outline-none focus:border-orange-300": true,
    ...(className && {
      [className]: true,
    }),
    "rounded": rounded,
    "shadow": shadow,
    [`hover:bg-${color}-200`]: !active && !attributes.disabled,
    [`bg-${color}-300`]: !outlined && active,
    [`border border-${color}-500`]: outlined && active,
    "border border-transparent": outlined && !active,
    ["opacity-50 cursor-auto"]: attributes.disabled,
  });

  return <button className={buttonClasses} {...attributes} />;
};

export const ToolbarButton: React.FC<Props> = ({ active = false, className, ...attributes }) => {
  const buttonClasses = classnames(
    "text-gray-800 py-2 flex-1 justify-center flex items-center py-1 px-2 focus:outline-none rounded focus:shadow-outline",
    {
      ...(className && {
        [className]: true,
      }),
      [`hover:text-orange-500`]: !active && !attributes.disabled,
      [`text-orange-600`]: active,
    }
  );

  return <button className={buttonClasses} {...attributes} />;
};
