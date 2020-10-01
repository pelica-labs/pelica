import { useEffect } from "react";

import { useStore } from "~/lib/state";

export const useKeyboard = (): void => {
  const dispatch = useStore((store) => store.dispatch);

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      dispatch.updateKeyboard({
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      });
    };

    window.addEventListener("keydown", onKeyPress, false);
    window.addEventListener("keyup", onKeyPress, false);

    return () => {
      window.removeEventListener("keydown", onKeyPress, false);
      window.removeEventListener("keyup", onKeyPress, false);
    };
  }, []);
};
