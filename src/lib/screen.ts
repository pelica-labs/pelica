import { throttle } from "lodash";
import { useEffect } from "react";

import { useStore } from "~/lib/state";

export type ScreenDimensions = {
  width: number;
  height: number;
};

export const useScreen = (): void => {
  const dispatch = useStore((store) => store.dispatch);

  useEffect(() => {
    const onResize = throttle(() => {
      dispatch.updateScreen(window.innerWidth, window.innerHeight);
    }, 200);

    window.addEventListener("load", onResize, false);
    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("load", onResize, false);
      window.removeEventListener("resize", onResize, false);
    };
  }, []);
};
