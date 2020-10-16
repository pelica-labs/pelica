import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const IconButton: React.FC<Props> = ({ active = false, className, ...attributes }) => {
  const buttonClasses = classNames(
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
