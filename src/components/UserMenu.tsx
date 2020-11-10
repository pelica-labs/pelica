import { Menu } from "@headlessui/react";
import classNames from "classnames";
import { signIn, signOut, useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { UserIcon } from "~/components/Icon";
import { GoogleButton } from "~/components/SocialButtons";

export const UserMenu: React.FC = () => {
  const [session, loading] = useSession();

  if (loading) {
    return null;
  }

  if (!session) {
    return (
      <Menu>
        {({ open }) => (
          <>
            <span className="flex rounded-md shadow-sm relative">
              <Menu.Button
                as="div"
                className={classNames({
                  "h-6 appearance-none inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out text-gray-800 rounded-md focus:outline-none": true,
                })}
              >
                <button
                  aria-label="Main menu"
                  className={classNames({
                    "rounded-full focus:outline-none focus:border-orange-300 transition duration-75 transform hover:scale-105 w-8 h-8 bg-gray-200 border border-gray-400 flex justify-center items-center text-gray-600 box-border": true,
                    "scale-110 hover:scale-110 border-orange-200": open,
                  })}
                >
                  <UserIcon className="w-6 h-6" />
                </button>
              </Menu.Button>

              {open && (
                <Menu.Items
                  static
                  className="fixed bottom-0 mb-16 md:mb-0 md:mt-10 md:bottom-auto z-50 left-0 md:left-auto right-0 md:w-56 md:mr-1 origin-top-right bg-white border md:rounded md:shadow outline-none py-1"
                >
                  <div className="flex flex-col">
                    <span className="my-2 px-2 text-gray-500 font-light tracking-wide leading-none uppercase text-xs">
                      Account
                    </span>

                    <div className="px-2">
                      <GoogleButton
                        onClick={() => {
                          signIn("google");
                        }}
                      />
                    </div>
                  </div>
                </Menu.Items>
              )}
            </span>
          </>
        )}
      </Menu>
    );
  }

  return (
    <Menu>
      {({ open }) => (
        <>
          <span className="flex rounded-md shadow-sm relative">
            <Menu.Button
              as="div"
              className={classNames({
                "appearance-none inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out text-gray-800 rounded-md focus:outline-none rounded": true,
              })}
            >
              <button
                aria-label="Main menu"
                className={classNames({
                  "rounded-full focus:outline-none focus:border-orange-300 transition duration-75 transform hover:scale-105": true,
                  "scale-110 hover:scale-110": open,
                })}
              >
                <Image
                  alt="User profile picture"
                  className="w-5 h-5 rounded-full border-2 border-orange-300"
                  height={32}
                  src={session.user.image}
                  width={32}
                />
              </button>
            </Menu.Button>

            {open && (
              <Menu.Items
                static
                className="fixed bottom-0 mb-16 md:mt-10 md:mb-0 md:bottom-auto z-50 left-0 md:left-auto right-0 md:w-56 md:mr-1 origin-top-right bg-white border md:rounded md:shadow outline-none py-1"
              >
                <div className="flex flex-col">
                  <span className="my-2 px-2 text-gray-500 font-light tracking-wide leading-none uppercase text-xs">
                    {session.user.name}
                  </span>

                  <Menu.Item>
                    {({ active }) => (
                      <Link href="/app">
                        <a
                          className={classNames({
                            "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                            "bg-orange-200": active,
                          })}
                        >
                          Saved maps
                        </a>
                      </Link>
                    )}
                  </Menu.Item>

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
  );
};
