import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import { GoogleIcon } from "~/components/ui/Icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const GoogleButton: React.FC<Props> = ({ className, onClick }) => {
  return (
    <button
      className={classNames(
        className,
        "border pr-2 py-1 text-xs rounded focus:outline-none focus:ring text-gray-700 hover:bg-gray-200 hover:bg-opacity-25"
      )}
      onClick={onClick}
    >
      <GoogleIcon className="w-8 h-8 inline-block" /> Sign in with Google
    </button>
  );
};
