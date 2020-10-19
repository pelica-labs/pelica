import React, { useEffect } from "react";

type Hotkey = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

type Callback = (event: KeyboardEvent) => void | false | Promise<void | false>;

type Cleanup = () => void;

export const registerHotkey = (hotkey: Hotkey, callback: Callback): Cleanup => {
  const onKey = (event: KeyboardEvent) => {
    const match =
      event.key === hotkey.key &&
      event.ctrlKey === (hotkey.ctrl ?? false) &&
      event.shiftKey === (hotkey.shift ?? false) &&
      event.altKey === (hotkey.alt ?? false) &&
      event.metaKey === (hotkey.meta ?? false);

    if (!match) {
      return;
    }

    const res = callback(event);

    if (res !== false) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  window.addEventListener("keydown", onKey, false);

  return () => {
    window.addEventListener("keydown", onKey, false);
  };
};

export const useHotkey = (hotkey: Hotkey, callback: Callback): (() => ReturnType<typeof HotkeyView>) => {
  useEffect(() => {
    return registerHotkey(hotkey, callback);
  }, []);

  return () => HotkeyView(hotkey);
};

export const HotkeyView: React.FC<Hotkey> = (hotkey) => {
  return (
    // @todo: hotkey symbols are MacOS only for now
    <span className="text-2xs uppercase text-gray-500 font-light tracking-wide leading-none flex space-x-px">
      {hotkey.ctrl && <span className="border border-gray-500 rounded p-1 w-5 flex justify-center">⌃</span>}
      {hotkey.shift && <span className="border border-gray-500 rounded p-1 w-5 flex justify-center">⇧</span>}
      {hotkey.alt && <span className="border border-gray-500 rounded p-1 w-5 flex justify-center">⌥</span>}
      {hotkey.meta && <span className="border border-gray-500 rounded p-1 w-5 flex justify-center">⌘</span>}
      <span className="border border-gray-500 rounded p-1 w-5 flex justify-center capitalize">{hotkey.key}</span>
    </span>
  );
};
