import { throttle } from "lodash";
import { useEffect } from "react";

import { useStore } from "~/lib/state";

export const useScreen = (): void => {
  const dispatch = useStore((store) => store.dispatch);

  useEffect(() => {
    const onResize = throttle(() => {
      dispatch.updateScreen(window.innerWidth, window.innerHeight);
    }, 200);

    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("resize", onResize, false);
    };
  }, []);
};
