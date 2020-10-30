import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Navbar: React.FC = () => {
  return (
    <header className="relative p-2 h-16 w-full flex items-center">
      <Link passHref href="/">
        <a className="mr-auto">
          <Image height={64} src="/images/icon-512.png" width={64} />
        </a>
      </Link>
      <a className="mx-4 text-gray-700 hover:text-gray-600 font-light" href="https://scratch.pelica.co">
        scratch map
      </a>
      <Link passHref href="/app">
        <button className="mx-4 bg-gray-700 hover:bg-gray-600 transition-colors duration-150 ease-in-out text-gray-100 px-6 py-1 rounded-full font-light focus:outline-none focus:shadow-outline">
          go to the app
        </button>
      </Link>
    </header>
  );
};
