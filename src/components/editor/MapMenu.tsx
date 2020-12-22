import { Menu } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";
import React, { useState } from "react";

import { MapTitleInput } from "~/components/editor/controls/MapTitleInput";
import { HotkeysModal } from "~/components/editor/HotkeysModal";
import { LanguagesSubMenu } from "~/components/editor/LanguagesSubMenu";
import { NavigationModal } from "~/components/editor/NavigationModal";
import { CopyIcon, DoubleCheckIcon, LanguageIcon, MenuIcon, RedoIcon, TrashIcon, UndoIcon } from "~/components/ui/Icon";
import { app, useStore } from "~/core/app";
import { Languages } from "~/core/languages";
import { useHotkey } from "~/hooks/useHotkey";
import { useLayout } from "~/hooks/useLayout";

export const MapMenu: React.FC = () => {
  const [showLanguagesMenu, setShowLanguagesMenu] = useState(false);
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const mapId = useStore((store) => store.sync.id);
  const language = useStore((store) => store.editor.language);
  const canSelectAll = useStore((store) => store.entities.items.length > 0);
  const canUndo = useStore((store) => store.history.actions.length > 0);
  const canRedo = useStore((store) => store.history.redoStack.length > 0);
  const canClear = useStore((store) => store.entities.items.length > 0);
  const isKeyboardAvailable = useStore((store) => store.platform.keyboard.available);
  const layout = useLayout();

  const UndoHotkey = useHotkey({ key: "z", meta: true }, () => {
    app.history.undo();
  });
  const RedoHotkey = useHotkey({ key: "z", meta: true, shift: true }, () => {
    app.history.redo();
  });
  const SelectAllHotkey = useHotkey({ key: "a", meta: true }, () => {
    app.selection.selectAll();
  });

  const onCloneMap = async () => {
    const res = await fetch("/api/clone-map", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: mapId,
      }),
    });

    const json = await res.json();

    window.open(`${window.location.origin}/app/${json.id}`, "_blank")?.focus();
  };

  return (
    <div className="flex items-center justify-center">
      <HotkeysModal
        isOpen={showHotkeysModal}
        onRequestClose={() => {
          setShowHotkeysModal(false);
        }}
      />

      <NavigationModal
        isOpen={showNavigationModal}
        onRequestClose={() => {
          setShowNavigationModal(false);
        }}
      />

      <div className="md:relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="flex rounded-md shadow-sm">
                <Menu.Button
                  as="div"
                  className={classNames({
                    "appearance-none inline-flex justify-center w-full text-sm font-medium leading-5 transition duration-150 ease-in-out rounded-md focus:outline-none hover:text-orange-600": true,
                    "text-orange-500": open,
                    "text-gray-200": !open,
                  })}
                >
                  <button className="px-2 py-1 focus:outline-none focus:border-orange-300">
                    <MenuIcon className="w-6 h-6" id="toolbar-menu" />
                  </button>
                </Menu.Button>
              </span>

              {showLanguagesMenu && (
                <LanguagesSubMenu
                  onSelect={() => {
                    setShowLanguagesMenu(false);
                  }}
                />
              )}

              {open && !showLanguagesMenu && (
                <Menu.Items
                  static
                  className="fixed top-0 mt-10 mb-16 md:mb-0 md:bottom-auto z-50 left-0 md:left-auto right-0 md:w-56 md:mr-1 origin-top-right bg-white border md:rounded md:shadow outline-none py-1"
                >
                  <div className="flex flex-col">
                    {layout.vertical && (
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
                      {({ active, disabled }) => (
                        <a
                          className={classNames({
                            "flex items-center justify-between px-2 py-1": true,
                            "bg-orange-200": active,
                            "hover:bg-orange-200 cursor-pointer": !disabled,
                            "text-gray-400": disabled,
                          })}
                          onClick={() => {
                            onCloneMap();
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Duplicate this map</span>
                            <CopyIcon className="w-3 h-3 text-gray-600" />
                          </span>
                        </a>
                      )}
                    </Menu.Item>

                    <div className="border-t my-1" />

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
                            setShowLanguagesMenu(true);
                          }}
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-sm">Language: {Languages[language]}</span>
                            <LanguageIcon className="w-3 h-3 text-gray-600" />
                          </span>
                        </a>
                      )}
                    </Menu.Item>

                    <div className="border-t my-1" />

                    {isKeyboardAvailable && (
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames({
                              "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                              "bg-orange-200": active,
                            })}
                            href="#"
                            onClick={() => {
                              setShowHotkeysModal(true);
                            }}
                          >
                            Hotkeys
                          </a>
                        )}
                      </Menu.Item>
                    )}

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames({
                            "text-gray-800 text-sm px-2 py-1 hover:bg-orange-200": true,
                            "bg-orange-200": active,
                          })}
                          href="#"
                          onClick={() => {
                            setShowNavigationModal(true);
                          }}
                        >
                          Navigation help
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
