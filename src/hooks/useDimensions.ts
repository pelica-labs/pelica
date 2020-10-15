import { throttle } from "lodash";
import { RefObject, useEffect, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

export type Dimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const useDimensions = (ref: RefObject<Element>, defaultValue: Dimensions | null = null): Dimensions | null => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(defaultValue);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver(
      throttle((elements: ResizeObserverEntry[]) => {
        if (!elements.length) {
          return;
        }

        setDimensions(elements[0].contentRect);
      }, 200)
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref.current]);

  return dimensions;
};
