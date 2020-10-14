import { Menu } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";
import React from "react";

import { MenuIcon, RedoIcon, TrashIcon, UndoIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";

export const MenuButton: React.FC = () => {
  const app = useApp();
  const canUndo = useStore((store) => store.history.actions.length > 0);
  const canRedo = useStore((store) => store.history.redoStack.length > 0);

  const UndoHotkey = useHotkey({ key: "z", meta: true, shift: false }, () => {
    app.history.undo();
  });
  const RedoHotkey = useHotkey({ key: "z", meta: true, shift: true }, () => {
    app.history.redo();
  });

  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="flex rounded-md shadow-sm">
                <Menu.Button
                  className={classNames({
                    "inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out text-gray-200 rounded-md focus:outline-none p-1": true,
                    "bg-orange-900 rounded": open,
                    "hover:text-orange-600": !open,
                  })}
                >
                  <MenuIcon className="w-4 h-4" />
                </Menu.Button>
              </span>

              {open && (
                <Menu.Items
                  static
                  className="absolute z-10 right-0 w-56 mt-2 origin-top-right bg-gray-900 border border-gray-700 rounded shadow shadow-outline outline-none py-1"
                >
                  <div className="flex flex-col">
                    <Menu.Item disabled={!canUndo}>
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-900": active,
                            "hover:bg-orange-900 cursor-pointer": !disabled,
                            "text-gray-600": disabled,
                          })}
                          onClick={() => {
                            app.history.undo();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Undo</span>
                            <UndoIcon className="w-3 h-3 text-gray-500" />
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
                            "bg-orange-900": active,
                            "hover:bg-orange-900 cursor-pointer": !disabled,
                            "text-gray-600": disabled,
                          })}
                          onClick={() => {
                            app.history.redo();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Redo</span>
                            <RedoIcon className="w-3 h-3 text-gray-500" />
                          </span>
                          <RedoHotkey />
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item disabled={!canUndo}>
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-900": active,
                            "hover:bg-orange-900 cursor-pointer": !disabled,
                            "text-gray-600": disabled,
                          })}
                          onClick={() => {
                            app.history.clear();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Clear canvas</span>
                            <TrashIcon className="w-3 h-3 text-gray-500" />
                          </span>
                        </a>
                      )}
                    </Menu.Item>

                    <div className="border-t border-gray-700 my-1" />

                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/">
                          <a
                            className={classNames({
                              "text-gray-200 text-sm px-2 py-1 hover:bg-orange-900": true,
                              "bg-orange-900": active,
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
                              "text-gray-200 text-sm px-2 py-1 hover:bg-orange-900": true,
                              "bg-orange-900": active,
                            })}
                          >
                            Contact us
                          </a>
                        </Link>
                      )}
                    </Menu.Item>
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
