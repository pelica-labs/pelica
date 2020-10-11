import React, { ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

import { icons } from "~/components/Icon";
import { pins } from "~/components/Pin";
import { getState } from "~/core/app";

const allIcons = icons();
const allPins = pins();

const transparentPixel = {
  width: 1,
  height: 1,
  data: new Uint8Array([0, 0, 0, 0]),
};

const idToComponent = (eventId: string) => {
  const [prefix, name, color] = eventId.split("-");

  const Component = prefix === "icon" ? allIcons[name] : allPins[name];
  const dimensions = prefix === "icon" ? [24, 24] : [54, 73];

  return {
    element: <Component color={color} />,
    dimensions: dimensions as [number, number],
  };
};

type MapImageMissingEvent = {
  id: string;
};

export const applyImageMissingHandler = (map: mapboxgl.Map): void => {
  const onImageMissing = async (event: MapImageMissingEvent) => {
    const { element, dimensions } = idToComponent(event.id);

    map.addImage(event.id, transparentPixel);

    const image = await generateImage(element, dimensions);

    map.removeImage(event.id);
    map.addImage(event.id, image, { pixelRatio: 2 });

    // 💩 Manually retriggers a re-render. This is far from ideal and looks glitchy.
  };

  map.on("styleimagemissing", onImageMissing);
};

export const generateImage = (element: ReactElement, [width, height]: [number, number]): Promise<ImageData> => {
  return new Promise((resolve) => {
    const svg = ReactDOMServer.renderToString(element);

    const image = new Image(width, height);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("failed to create canvas 2d context");
      }

      context.drawImage(image, 0, 0, width, height);

      resolve(context.getImageData(0, 0, width, height));
    };

    image.src = `data:image/svg+xml;base64,` + btoa(svg);
  });
};
