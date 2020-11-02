import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import { GoogleIcon } from "~/components/Icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const GoogleButton: React.FC<Props> = ({ className, onClick }) => {
  return (
    <button
      className={classNames(
        className,
        "border pr-2 py-1 text-xs rounded focus:outline-none focus:shadow-outline text-gray-700"
      )}
      onClick={onClick}
    >
      <GoogleIcon className="w-8 h-8 inline-block" /> sign in with Google
    </button>
  );
};
