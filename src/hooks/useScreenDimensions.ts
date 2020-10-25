import { throttle } from "lodash";
import { useEffect } from "react";

import { useApp } from "~/core/app";

export const useScreenDimensions = (): void => {
  const app = useApp();

  useEffect(() => {
    const onResize = throttle(() => {
      app.platform.updateScreen(window.innerWidth, window.innerHeight);
    }, 200);

    window.addEventListener("load", onResize, false);
    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("load", onResize, false);
      window.removeEventListener("resize", onResize, false);
    };
  }, []);
};
