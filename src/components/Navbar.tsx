import { Menu } from "@headlessui/react";
import classNames from "classnames";
import { signOut, useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export const Navbar: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const [session] = useSession();

  const createMap = async () => {
    setCreating(true);
    const res = await fetch("/api/create-map", {
      method: "POST",
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  return (
    <header className="absolute pl-2 pr-4 h-16 w-full flex items-center bg-white shadow">
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

      {session && (
        <Menu>
          {({ open }) => (
            <>
              <span className="flex rounded-md shadow-sm relative">
                <Menu.Button
                  as="div"
                  className={classNames({
                    "appearance-none inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out text-gray-800 rounded-md focus:outline-none": true,
                    "bg-orange-200 rounded": open && !session,
                    "hover:text-orange-600": !open,
                  })}
                >
                  {session && (
                    <button
                      className={classNames({
                        "rounded-full focus:outline-none focus:border-orange-300 transition duration-75 transform hover:scale-105": true,
                        "scale-110 hover:scale-110": open,
                      })}
                    >
                      <Image
                        className="w-8 h-8 md:w-6 md:h-6 rounded-full border-2 border-orange-300"
                        height={40}
                        src={session.user.image}
                        width={40}
                      />
                    </button>
                  )}
                </Menu.Button>

                {open && (
                  <Menu.Items
                    static
                    className="absolute mt-10 z-50 w-48 top-0 right-0 origin-top-right bg-white border rounded shadow outline-none py-1"
                  >
                    <div className="flex flex-col">
                      <span className="my-2 px-2 text-gray-500 font-light tracking-wide leading-none uppercase text-xs">
                        {session.user.name}
                      </span>

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200 cursor-pointer": true,
                              "bg-orange-200": active,
                            })}
                            onClick={async () => {
                              await signOut();
                              window.location.replace("/");
                            }}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                )}
              </span>
            </>
          )}
        </Menu>
      )}
    </header>
  );
};
