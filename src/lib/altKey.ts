import { useEffect, useState } from "react";

export const useAltKey = (): boolean => {
  const [altIsPressed, setAltIsPressed] = useState(false);

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      setAltIsPressed(event.altKey);
    };

    window.addEventListener("keydown", onKeyPress, false);
    window.addEventListener("keyup", onKeyPress, false);

    return () => {
      window.removeEventListener("keydown", onKeyPress, false);
      window.removeEventListener("keyup", onKeyPress, false);
    };
  }, []);

  return altIsPressed;
};
