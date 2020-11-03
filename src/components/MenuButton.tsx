import { Menu } from "@headlessui/react";
import classNames from "classnames";
import { signIn, signOut, useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { DoubleCheckIcon, MenuIcon, RedoIcon, TrashIcon, UndoIcon } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { MapTitleInput } from "~/components/MapTitleInput";
import { app, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";

export const MenuButton: React.FC = () => {
  const canSelectAll = useStore((store) => store.entities.items.length > 0);
  const canUndo = useStore((store) => store.history.actions.length > 0);
  const canRedo = useStore((store) => store.history.redoStack.length > 0);
  const canClear = useStore((store) => store.entities.items.length > 0);
  const mapId = useStore((store) => store.sync.id);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const [session] = useSession();

  const UndoHotkey = useHotkey({ key: "z", meta: true }, () => {
    app.history.undo();
  });
  const RedoHotkey = useHotkey({ key: "z", meta: true, shift: true }, () => {
    app.history.redo();
  });
  const SelectAllHotkey = useHotkey({ key: "a", meta: true }, () => {
    app.selection.selectAll();
  });

  return (
    <div className="flex items-center justify-center">
      <div className="md:relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="flex rounded-md shadow-sm">
                <Menu.Button
                  as="div"
                  className={classNames({
                    "appearance-none inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out rounded-md focus:outline-none": true,
                    "bg-orange-200 rounded": open && !session,
                    "hover:text-orange-600": !open,
                  })}
                >
                  <IconButton>
                    <MenuIcon className="w-8 h-8 md:w-6 md:h-6" id="toolbar-menu" />
                  </IconButton>
                </Menu.Button>
              </span>

              {open && (
                <Menu.Items
                  static
                  className="fixed bottom-0 mb-16 md:mb-0 md:bottom-auto z-50 left-0 md:left-auto right-0 md:w-56 md:mr-1 origin-top-right bg-white border md:rounded md:shadow outline-none py-1"
                >
                  <div className="flex flex-col">
                    {!screenDimensions.md && (
                      <>
                        <div className="px-1">
                          <MapTitleInput />
                        </div>
                        <div className="border-t my-1" />
                      </>
                    )}

                    <Menu.Item disabled={!canUndo}>
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-200": active,
                            "hover:bg-orange-200 cursor-pointer": !disabled,
                            "text-gray-400": disabled,
                          })}
                          onClick={() => {
                            app.history.undo();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Undo</span>
                            <UndoIcon className="w-3 h-3 text-gray-700" />
                          </span>
                          <UndoHotkey />
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item disabled={!canRedo}>
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-200": active,
                            "hover:bg-orange-200 cursor-pointer": !disabled,
                            "text-gray-400": disabled,
                          })}
                          onClick={() => {
                            app.history.redo();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Redo</span>
                            <RedoIcon className="w-3 h-3 text-gray-600" />
                          </span>
                          <RedoHotkey />
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item disabled={!canSelectAll}>
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-200": active,
                            "hover:bg-orange-200 cursor-pointer": !disabled,
                            "text-gray-400": disabled,
                          })}
                          onClick={() => {
                            app.selection.selectAll();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Select all</span>
                            <DoubleCheckIcon className="w-3 h-3 text-gray-600" />
                          </span>
                          <SelectAllHotkey />
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item disabled={!canClear}>
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-200": active,
                            "hover:bg-orange-200 cursor-pointer": !disabled,
                            "text-gray-400": disabled,
                          })}
                          onClick={() => {
                            app.history.clear();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Clear canvas</span>
                            <TrashIcon className="w-3 h-3 text-gray-600" />
                          </span>
                        </a>
                      )}
                    </Menu.Item>

                    <div className="border-t my-1" />

                    <Menu.Item>
                      {({ active }) => (
                        <Link href={`/map/${mapId}`}>
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                              "bg-orange-200": active,
                            })}
                          >
                            Preview
                          </a>
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/app">
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                              "bg-orange-200": active,
                            })}
                          >
                            New map
                          </a>
                        </Link>
                      )}
                    </Menu.Item>

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
                        <Link href="/">
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                              "bg-orange-200": active,
                            })}
                          >
                            About Pelica
                          </a>
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link href="mailto:hey@pelica.co">
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                              "bg-orange-200": active,
                            })}
                          >
                            Contact us
                          </a>
                        </Link>
                      )}
                    </Menu.Item>

                    <div className="border-t my-1" />

                    {!session && (
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200 cursor-pointer": true,
                              "bg-orange-200": active,
                            })}
                            onClick={async () => {
                              signIn("google");
                            }}
                          >
                            Sign in
                          </a>
                        )}
                      </Menu.Item>
                    )}

                    {session && (
                      <>
                        <div className="flex items-center my-2 px-2 space-x-3">
                          <Image
                            className="w-8 h-8 md:w-6 md:h-6 rounded-full border-2 border-orange-300"
                            height={24}
                            src={session.user.image}
                            width={24}
                          />
                          <span className="text-gray-500 font-light tracking-wide leading-none uppercase text-xs">
                            {session.user.name}
                          </span>
                        </div>

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
                      </>
                    )}
                  </div>
                </Menu.Items>
              )}
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};
