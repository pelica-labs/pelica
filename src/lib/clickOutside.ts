import { useEffect } from "react";

export const useClickOutside = (element: HTMLElement | null, callback: () => void): void => {
  useEffect(() => {
    const onClick = (event: MouseEvent | TouchEvent) => {
      if (!element) {
        return;
      }

      if (!element.contains(event.target as Node)) {
        callback();
      }
    };

    window.addEventListener("mousedown", onClick);
    window.addEventListener("touchstart", onClick);

    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("touchstart", onClick);
    };
  }, [element]);
};
