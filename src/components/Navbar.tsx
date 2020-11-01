import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { NavLink } from "~/components/NavLink";

export const Navbar: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createMap = async () => {
    setCreating(true);
    const res = await fetch("/api/create-map", {
      method: "POST",
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  return (
    <header className="relative p-2 h-16 w-full flex items-center">
      <div className="mr-auto flex items-center">
        <Link passHref href="/">
          <a>
            <Image height={48} src="/images/icon-512.png" width={48} />
          </a>
        </Link>

        <NavLink passHref href="/maps">
          <a className="lg:mx-4 md:mx-2 text-gray-700 hover:text-gray-600 font-light whitespace-no-wrap">Saved maps</a>
        </NavLink>
      </div>

      <a className="hidden md:block mx-4 text-gray-700 hover:text-gray-600 font-light" href="https://scratch.pelica.co">
        scratch map
      </a>

      <button
        className="mx-4 bg-gray-700 hover:bg-gray-600 transition-colors duration-150 ease-in-out text-gray-100 px-6 py-1 rounded-full font-light focus:outline-none focus:shadow-outline"
        disabled={creating}
        onClick={() => {
          createMap();
        }}
      >
        <span className="hidden sm:block">{creating ? "creating map..." : "go to the app"}</span>
        <span className="sm:hidden">{creating ? "creating..." : "app"}</span>
      </button>
    </header>
  );
};
