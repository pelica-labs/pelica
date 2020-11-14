import classNames from "classnames";
import React from "react";

type Props = React.HTMLProps<HTMLParagraphElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "p";
};

export const Heading: React.FC<Props> = ({ as: Component = "h2", children, className, ...props }) => {
  return (
    <Component
      className={classNames(className, {
        "text-sm md:text-xs font-semibold tracking-wide leading-none text-gray-800": true,
      })}
      {...props}
    >
      {children}
    </Component>
  );
};
