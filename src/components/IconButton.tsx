import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import { Tooltip, TooltipProps } from "~/components/Tooltip";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  tooltip?: TooltipProps;
};

export const IconButton: React.FC<Props> = ({ active = false, className, tooltip, ...attributes }) => {
  const buttonClasses = classNames({
    "text-gray-800 py-2 flex-1 justify-center flex items-center py-1 px-2 focus:outline-none rounded focus:shadow-outline": true,
    ...(className && {
      [className]: true,
    }),
    [`hover:text-orange-500`]: !active && !attributes.disabled,
    [`text-orange-600`]: active,
  });

  const button = <button className={buttonClasses} {...attributes} />;

  if (tooltip) {
    return <Tooltip {...tooltip}>{button}</Tooltip>;
  }

  return button;
};
