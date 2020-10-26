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

type ImageComponents = {
  pin: ReactElement;
  icon: ReactElement;
  dimensions: [number, number];
  offset: number;
};

type PinProps = {
  pin: string;
  icon: string;
  color: string;
};

const idToComponents = (eventId: string): ImageComponents | null => {
  let json: PinProps | null = null;
  try {
    json = JSON.parse(eventId);
  } catch (error) {
    console.warn("Could not parse image missing to ImageComponents", eventId, error);
  } finally {
    if (!json) {
      return null;
    }
  }

  const { pin, icon, color } = json;

  const { component: Pin, dimensions, offset } = allPins[pin];
  const Icon = allIcons[icon];

  if (!Pin || !Icon) {
    return null;
  }

  return {
    pin: <Pin color={color} />,
    icon: <Icon color={color} />,
    dimensions,
    offset,
  };
};

type MapImageMissingEvent = {
  id: string;
};

export const applyImageMissingHandler = (map: mapboxgl.Map): void => {
  const onImageMissing = async (event: MapImageMissingEvent) => {
    const components = idToComponents(event.id);

    map.addImage(event.id, transparentPixel);

    if (!components) {
      return;
    }

    const image = await generateImage(components);

    map.removeImage(event.id);
    map.addImage(event.id, image, { pixelRatio: 2 });

    // 💩 Manually retriggers a re-render. This is far from ideal and looks glitchy.
    setTimeout(() => {
      getState().entities.forceRerender();
    });
  };

  map.on("styleimagemissing", onImageMissing);
};

export const generateImage = (components: ImageComponents): Promise<ImageData> => {
  const pinWidth = components.dimensions[0];
  const pinHeight = components.dimensions[1];
  const iconWidth = 32;
  const iconHeight = 32;
  const scale = 4;

  return new Promise(async (resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = pinWidth * scale;
    canvas.height = pinHeight * scale;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("failed to create canvas 2d context");
    }

    await drawImage(context, {
      svg: components.pin,
      width: pinWidth * scale,
      height: pinHeight * scale,
      offsetX: 0,
      offsetY: 0,
    });

    await drawImage(context, {
      svg: components.icon,
      width: iconWidth * scale,
      height: iconHeight * scale,
      offsetX: ((pinWidth - iconWidth) / 2) * scale,
      offsetY: components.offset * scale,
    });

    resolve(context.getImageData(0, 0, pinWidth * scale, pinHeight * scale));
  });
};

type DrawImageOptions = {
  svg: ReactElement;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

const drawImage = (context: CanvasRenderingContext2D, options: DrawImageOptions) => {
  return new Promise((resolve) => {
    const rawSvg = ReactDOMServer.renderToString(options.svg);

    const image = new Image(options.width, options.height);

    image.onload = () => {
      context.drawImage(image, options.offsetX, options.offsetY, options.width, options.height);
      resolve();
    };

    image.src = `data:image/svg+xml;base64,` + btoa(rawSvg);
  });
};
