import classNames from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import { FacebookLogoIcon, GoogleIcon } from "~/components/ui/Icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const GoogleButton: React.FC<Props> = ({ className, onClick }) => {
  return (
    <button
      className={classNames(
        className,
        "flex items-center space-x-2 border px-2 py-1 text-xs rounded focus:outline-none focus:ring text-gray-700 hover:bg-gray-200 hover:bg-opacity-25"
      )}
      onClick={onClick}
    >
      <GoogleIcon className="w-4 h-4 inline-block" />
      <span className="flex-1 text-center">Sign in with Google</span>
    </button>
  );
};

export const FacebookButton: React.FC<Props> = ({ className, onClick }) => {
  return (
    <button
      className={classNames(
        className,
        "flex items-center space-x-2 border px-2 py-1 text-xs rounded focus:outline-none focus:ring text-gray-700 hover:bg-gray-200 hover:bg-opacity-25"
      )}
      onClick={onClick}
    >
      <FacebookLogoIcon className="w-4 h-4 inline-block" />
      <span className="flex-1">Sign in with Facebook</span>
    </button>
  );
};
