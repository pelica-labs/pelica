import React, { useCallback, useEffect } from "react";

import { useStore } from "~/core/app";

type Hotkey = HotkeyModifiers & {
  key?: string;
  value?: string;
  global?: boolean;
};

type HotkeyModifiers = {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

type Callback = (event: KeyboardEvent) => void | false | Promise<void | false>;

export const useHotkey = (hotkey: Hotkey, callback: Callback): (() => ReturnType<typeof HotkeyView>) => {
  const appleLike = useStore((store) => store.platform.system.appleLike);

  const onKey = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!hotkey.global && target.tagName !== "CANVAS" && target.tagName !== "BODY" && target.tagName !== "BUTTON") {
        return;
      }

      const { ctrl, shift, alt, meta } = normalizeHotkey(appleLike, hotkey);

      const match =
        event.key === hotkey.key &&
        event.ctrlKey === (ctrl ?? false) &&
        event.shiftKey === (shift ?? false) &&
        event.altKey === (alt ?? false) &&
        event.metaKey === (meta ?? false);

      if (!match) {
        return;
      }

      const res = callback(event);

      if (res !== false) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [appleLike]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey, false);

    return () => {
      window.removeEventListener("keydown", onKey, false);
    };
  }, [appleLike]);

  return () => HotkeyView(hotkey);
};

export const HotkeyView: React.FC<Hotkey> = (hotkey) => {
  const keyboardAvailable = useStore((store) => store.platform.keyboard.available);
  const appleLike = useStore((store) => store.platform.system.appleLike);

  if (!keyboardAvailable) {
    return null;
  }

  const { ctrl, shift, alt, meta } = normalizeHotkey(appleLike, hotkey);

  const ctrlSymbol = appleLike ? "⌃" : "Ctrl";
  const shiftSymbol = appleLike ? "⇧" : "Shift";
  const altSymbol = appleLike ? "⌥" : "Alt";
  const metaSymbol = appleLike ? "⌘" : "Win";

  return (
    // @todo: hotkey symbols are MacOS only for now
    <span className="text-2xs  text-gray-500 font-light tracking-wide leading-none inline-flex space-x-2px">
      {meta && <span className="border border-gray-400 rounded p-1 flex justify-center">{metaSymbol}</span>}
      {ctrl && <span className="border border-gray-400 rounded p-1 flex justify-center">{ctrlSymbol}</span>}
      {shift && <span className="border border-gray-400 rounded p-1 flex justify-center">{shiftSymbol}</span>}
      {alt && <span className="border border-gray-400 rounded p-1 flex justify-center">{altSymbol}</span>}
      <span className="border border-gray-400 rounded p-1 flex justify-center capitalize">
        {hotkey.key || hotkey.value}
      </span>
    </span>
  );
};

const normalizeHotkey = (appleLike: boolean, hotkey: HotkeyModifiers): HotkeyModifiers => {
  if (appleLike) {
    return hotkey;
  }

  return {
    ctrl: hotkey.meta,
    alt: hotkey.alt,
    shift: hotkey.shift,
    meta: false,
  };
};
