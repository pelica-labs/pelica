import { debounce } from "lodash";
import { useEffect, useState } from "react";
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

export const useDimensions = (element: Element | null, defaultValue: Dimensions | null = null): Dimensions | null => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(defaultValue);

  useEffect(() => {
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(
      debounce((elements: ResizeObserverEntry[]) => {
        if (!elements.length) {
          return;
        }

        setDimensions(elements[0].contentRect);
      }, 200)
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return dimensions;
};
