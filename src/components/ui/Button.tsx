import classnames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import { Tooltip, TooltipProps } from "~/components/ui/Tooltip";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  shadow?: boolean;
  tooltip?: TooltipProps;
};

export const Button: React.FC<Props> = ({
  rounded = true,
  shadow = true,
  active = false,
  outlined = false,
  tooltip,
  className,
  ...attributes
}) => {
  const buttonClasses = classnames({
    "flex items-center py-1 px-2 focus:outline-none focus:border-orange-300 border": true,
    ...(className && {
      [className]: true,
    }),
    "rounded": rounded,
    "shadow": shadow,
    [`hover:bg-orange-100`]: !active && !attributes.disabled,
    [`bg-orange-300`]: !outlined && active,
    [`border border-orange-500`]: outlined && active,
    "border border-transparent": outlined && !active,
    ["opacity-50 cursor-auto"]: attributes.disabled,
  });

  const button = <button className={buttonClasses} {...attributes} />;

  if (tooltip) {
    return <Tooltip {...tooltip}>{button}</Tooltip>;
  }

  return button;
};
