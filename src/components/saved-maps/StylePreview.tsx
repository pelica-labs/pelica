import React from "react";
import { Blurhash } from "react-blurhash";
import BounceLoader from "react-spinners/BounceLoader";

import { theme } from "~/styles/tailwind";

type Props = {
  src: string | null;
  hash: string | null;
};

export const StylePreview: React.FC<Props> = ({ src, hash }) => {
  return (
    <div className="flex-grow flex relative justify-center items-center md:w-full rounded overflow-hidden">
      {hash && (
        <div className="absolute w-full h-full">
          <Blurhash hash={hash} height="100%" punch={1} resolutionX={32} resolutionY={32} width="100%" />
        </div>
      )}

      <BounceLoader color={theme.colors.orange[500]} size={20} />

      {src && (
        <img className="absolute w-full h-full rounded object-cover object-center border border-gray-400" src={src} />
      )}
    </div>
  );
};
