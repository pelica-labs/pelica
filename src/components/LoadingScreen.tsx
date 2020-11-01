import React from "react";
import BounceLoader from "react-spinners/BounceLoader";

import { theme } from "~/styles/tailwind";

type Props = {
  title: string;
  subTitle?: string;
};

export const LoadingScreen: React.FC<Props> = ({ title, subTitle }) => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900 ">
      <span className="text-gray-200 text-xl">{title}</span>
      {subTitle && <span className="mt-2 text-gray-400 text-base">{subTitle}</span>}
      <div className="mt-8">
        <BounceLoader color={theme.colors.orange[500]} size={50} />
      </div>
    </div>
  );
};
