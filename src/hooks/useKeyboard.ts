import { useEffect } from "react";

import { useApp } from "~/core/app";

export const useKeyboard = (): void => {
  const app = useApp();

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      app.keyboard.updateKeyboard({
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      });
    };

    const onWindowBlur = () => {
      app.keyboard.updateKeyboard({
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
      });
    };

    window.addEventListener("keydown", onKeyPress, false);
    window.addEventListener("keyup", onKeyPress, false);
    window.addEventListener("blur", onWindowBlur, false);

    return () => {
      window.removeEventListener("keydown", onKeyPress, false);
      window.removeEventListener("keyup", onKeyPress, false);
      window.removeEventListener("blur", onWindowBlur, false);
    };
  }, []);
};
