import { MutableRefObject, useEffect, useRef, useState } from "react";

export const useClickOutside = <T extends HTMLElement>(callback: EventListener): MutableRefObject<T | null> => {
  const container = useRef<T>(null);
  const [isTouchEvent, setTouchEvent] = useState(false);

  const eventType = isTouchEvent ? "touchend" : "click";

  const handleEvent = (event: Event) => {
    if (event.type === "click" && isTouchEvent) {
      return;
    }

    if (!container.current || event.target === null) {
      return;
    }

    if (!container.current.contains(event.target as Node)) {
      callback(event);
    }
  };

  useEffect(() => {
    document.addEventListener(eventType, handleEvent, true);

    return () => {
      document.removeEventListener(eventType, handleEvent, true);
    };
  });

  useEffect(() => {
    setTouchEvent("ontouchstart" in document.documentElement);
  }, []);

  return container;
};
