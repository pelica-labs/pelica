import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

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
    <header className="relative p-2 h-16 w-full flex items-center bg-white shadow">
      <div className="mr-auto flex items-center">
        <Link passHref href="/">
          <a>
            <Image height={48} src="/images/icon-512.png" width={48} />
          </a>
        </Link>
      </div>
      {router.pathname === "/app" ? (
        <button
          className="mx-4 bg-gray-700 hover:bg-gray-600 transition-colors duration-150 ease-in-out text-gray-100 px-6 py-1 rounded-full font-light focus:outline-none focus:shadow-outline"
          disabled={creating}
          onClick={() => {
            createMap();
          }}
        >
          <span className="block">{creating ? "creating map..." : "new map"}</span>
        </button>
      ) : (
        <Link href="/app">
          <button className="mx-4 bg-gray-700 hover:bg-gray-600 transition-colors duration-150 ease-in-out text-gray-100 px-6 py-1 rounded-full font-light focus:outline-none focus:shadow-outline">
            <span className="block">my maps</span>
          </button>
        </Link>
      )}
    </header>
  );
};
