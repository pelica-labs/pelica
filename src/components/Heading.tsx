import classNames from "classnames";
import React from "react";

type Props = React.HTMLProps<HTMLParagraphElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "p";

  dark?: boolean;
};

export const Heading: React.FC<Props> = ({ as: Component = "h2", children, className, dark = false, ...props }) => {
  return (
    <Component
      className={classNames(className, {
        "text-sm md:text-xs uppercase font-light tracking-wide leading-none": true,
        "text-gray-800": !dark,
        "text-gray-100": dark,
      })}
      {...props}
    >
      {children}
    </Component>
  );
};
