import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import { Tooltip, TooltipProps } from "~/components/Tooltip";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  dark?: boolean;
  tooltip?: TooltipProps;
};

export const IconButton: React.FC<Props> = ({ active = false, dark = false, className, tooltip, ...attributes }) => {
  const buttonClasses = classNames({
    "flex-1 justify-center flex items-center md:p-2 p-3 focus:outline-none border border-transparent focus:shadow-outline rounded": true,
    ...(className && {
      [className]: true,
    }),
    "text-gray-800": !dark,
    "text-gray-100": dark,
    [`hover:text-orange-500`]: !active && !attributes.disabled,
    [`text-orange-600 bg-orange-100 border-orange-200`]: active,
  });

  const button = <button className={buttonClasses} {...attributes} />;

  if (tooltip) {
    return <Tooltip {...tooltip}>{button}</Tooltip>;
  }

  return button;
};
