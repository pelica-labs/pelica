import React, { useCallback, useEffect } from "react";

type Hotkey = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

type Callback = (event: KeyboardEvent) => void | false;

export const useHotkey = (hotkey: Hotkey, callback: Callback): (() => ReturnType<typeof HotkeyView>) => {
  const onKey = useCallback((event: KeyboardEvent) => {
    const match =
      event.key === hotkey.key &&
      (hotkey.ctrl === undefined || event.ctrlKey === hotkey.ctrl) &&
      (hotkey.shift === undefined || event.shiftKey === hotkey.shift) &&
      (hotkey.alt === undefined || event.altKey === hotkey.alt) &&
      (hotkey.meta === undefined || event.metaKey === hotkey.meta);

    if (!match) {
      return;
    }

    const res = callback(event);

    if (res !== false) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey, false);

    return () => {
      window.addEventListener("keydown", onKey, false);
    };
  }, []);

  return () => HotkeyView(hotkey);
};

export const HotkeyView: React.FC<Hotkey> = (hotkey) => {
  return (
    // @todo: hotkey symbols are MacOS only for now
    <span className="text-2xs uppercase text-gray-700 font-light tracking-wide leading-none flex space-x-px">
      {hotkey.ctrl && <span className="border border-gray-600 rounded p-1 w-5 flex justify-center">⌃</span>}
      {hotkey.shift && <span className="border border-gray-600 rounded p-1 w-5 flex justify-center">⇧</span>}
      {hotkey.alt && <span className="border border-gray-600 rounded p-1 w-5 flex justify-center">⌥</span>}
      {hotkey.meta && <span className="border border-gray-600 rounded p-1 w-5 flex justify-center">⌘</span>}
      <span className="border border-gray-600 rounded p-1 w-5 flex justify-center capitalize">{hotkey.key}</span>
    </span>
  );
};
