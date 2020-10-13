import React from "react";
import BounceLoader from "react-spinners/BounceLoader";

import { theme } from "~/styles/tailwind";

type Props = {
  src: string | null;
};

export const StylePreview: React.FC<Props> = ({ src }) => {
  return (
    <div className="flex relative justify-center items-center w-full h-full mt-1 border border-gray-700 overflow-hidden">
      {!src && <span className="text-xs text-gray-500">Preview unavailable</span>}

      <BounceLoader color={theme.colors.green[500]} size={20} />

      {src && <img className="absolute" src={src} />}
    </div>
  );
};
