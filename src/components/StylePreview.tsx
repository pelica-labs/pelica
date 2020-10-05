import React from "react";
import PuffLoader from "react-spinners/PuffLoader";

import { theme } from "~/styles/tailwind.json";

type Props = {
  src: string | null;
};

export const StylePreview: React.FC<Props> = ({ src }) => {
  return (
    <div className="flex relative justify-center items-center w-32 h-32 mt-1 border border-gray-700">
      {!src && <span className="text-xs text-gray-500">Preview unavailable</span>}

      <PuffLoader color={theme.colors.green[500]} size={50} />
      {src && <img className="absolute" src={src} />}
    </div>
  );
};
