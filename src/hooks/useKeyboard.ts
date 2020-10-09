import { useEffect } from "react";

import { useApp } from "~/core/app";

export const useKeyboard = (): void => {
  const app = useApp();

  useEffect(() => {
    const onEvent = (event: KeyboardEvent | MouseEvent | WheelEvent | TouchEvent) => {
      app.keyboard.updateKeyboard({
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      });
    };

    window.addEventListener("keydown", onEvent, false);
    window.addEventListener("keyup", onEvent, false);
    window.addEventListener("click", onEvent, false);
    window.addEventListener("contextmenu", onEvent, false);
    window.addEventListener("wheel", onEvent, false);
    window.addEventListener("mousemove", onEvent, false);
    window.addEventListener("mouseenter", onEvent, false);
    window.addEventListener("mouseleave", onEvent, false);
    window.addEventListener("touchmove", onEvent, false);
    window.addEventListener("touchstart", onEvent, false);
    window.addEventListener("touchend", onEvent, false);

    return () => {
      window.removeEventListener("keydown", onEvent, false);
      window.removeEventListener("keyup", onEvent, false);
      window.removeEventListener("click", onEvent, false);
      window.removeEventListener("contextmenu", onEvent, false);
      window.removeEventListener("wheel", onEvent, false);
      window.removeEventListener("mousemove", onEvent, false);
      window.removeEventListener("mouseenter", onEvent, false);
      window.removeEventListener("mouseleave", onEvent, false);
      window.removeEventListener("touchmove", onEvent, false);
      window.removeEventListener("touchstart", onEvent, false);
      window.removeEventListener("touchend", onEvent, false);
    };
  }, []);
};
