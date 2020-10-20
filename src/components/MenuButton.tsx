import { Menu } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";
import React from "react";

import { DoubleCheckIcon, MenuIcon, RedoIcon, TrashIcon, UndoIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";
import { useHotkey } from "~/hooks/useHotkey";

export const MenuButton: React.FC = () => {
  const app = useApp();
  const canSelectAll = useStore((store) => store.entities.items.length > 0);
  const canUndo = useStore((store) => store.history.actions.length > 0);
  const canRedo = useStore((store) => store.history.redoStack.length > 0);

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
                  className={classNames({
                    "inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out text-gray-800 rounded-md focus:outline-none p-1": true,
                    "bg-orange-200 rounded": open,
                    "hover:text-orange-600": !open,
                  })}
                >
                  <MenuIcon className="w-6 h-6" />
                </Menu.Button>
              </span>

              {open && (
                <Menu.Items
                  static
                  className="fixed bottom-0 mb-12 md:mb-0 md:mr-2 md:bottom-auto z-50 left-0 md:left-auto right-0 md:right-auto md:w-56 mt-1 origin-top-right bg-white border md:rounded md:shadow outline-none py-1"
                >
                  <div className="flex flex-col">
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
