import React, { ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

import { icons } from "~/components/Icon";
import { pins } from "~/components/Pin";

const allIcons = icons();
const allPins = pins();

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
  const onImageMissing = (event: MapImageMissingEvent) => {
    const { element, dimensions } = idToComponent(event.id);

    generateImage(element, dimensions).then((image) => {
      if (map.hasImage(event.id)) {
        map.removeImage(event.id);
      }

      map.addImage(event.id, image, { pixelRatio: 2 });

      // 💩 This doesn't work and the image won't render when first loaded.
      map.setLayoutProperty("pins", "visibility", "none");
      setTimeout(() => {
        map.setLayoutProperty("pins", "visibility", "visible");
        setTimeout(() => {
          map.triggerRepaint();
        });
      });
    });

    map.addImage(event.id, {
      width: 1,
      height: 1,
      data: generatePlaceholder(),
    });
  };

  map.on("styleimagemissing", onImageMissing);
};

export const generateImage = (element: ReactElement, dimensions: [number, number]): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const svg = ReactDOMServer.renderToString(element);
    const image = new Image(dimensions[0], dimensions[1]);
    image.src = `data:image/svg+xml;base64,` + btoa(svg);

    image.onload = () => {
      resolve(getImageData(image));
    };

    image.onerror = (err) => {
      reject(err);
    };
  });
};

export const generatePlaceholder = (): Uint8Array => {
  const data = new Uint8Array(4);
  data[0] = 0;
  data[1] = 0;
  data[2] = 0;
  data[3] = 0;

  return data;
};

const getImageData = (img: HTMLImageElement): ImageData => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("failed to create canvas 2d context");
  }

  context.drawImage(img, 0, 0, img.width, img.height);

  return context.getImageData(0, 0, img.width, img.height);
};
