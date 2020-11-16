import Image from "next/image";
import Link from "next/link";
import React from "react";

export const OverlayedLogo: React.FC = () => {
  return (
    <div className="fixed top-0 right-0 mt-2 mr-2 w-16 h-16 rounded-lg shadow bg-gray-800 bg-opacity-75 hover:bg-gray-900 border-2 border-transparent hover:border-orange-400 transform transition duration-75 ease-in-out hover:scale-105">
      <Link passHref href="/">
        <a title="Pelica homepage">
          <Image alt="Pelica logo" height={80} src="/images/icon-512.png" width={80} />
        </a>
      </Link>
    </div>
  );
};
