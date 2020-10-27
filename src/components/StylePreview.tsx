import Image from "next/image";
import React from "react";
import { Blurhash } from "react-blurhash";
import BounceLoader from "react-spinners/BounceLoader";

import { theme } from "~/styles/tailwind";

type Props = {
  src: string | null;
  hash: string | null;
  width: number;
  height: number;
};

export const StylePreview: React.FC<Props> = ({ src, hash, width, height }) => {
  return (
    <div className="flex relative justify-center items-center w-40 md:w-full h-full mt-1 border overflow-hidden">
      {hash && (
        <div className="absolute w-full h-full">
          <Blurhash hash={hash} height="100%" punch={1} resolutionX={32} resolutionY={32} width="100%" />
        </div>
      )}

      <BounceLoader color={theme.colors.orange[500]} size={20} />

      {src && (
        <div className="absolute">
          <Image priority height={height} quality={70} src={src} width={width} />
        </div>
      )}
    </div>
  );
};
