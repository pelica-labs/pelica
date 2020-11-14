import React, { ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

import { pins } from "~/components/editor/Pin";
import { getState } from "~/core/app";
import { PinIcon } from "~/core/pins";
import { getMap } from "~/core/selectors";
import { findIcon, imgSrcFromEmojiName } from "~/hooks/useIcon";

const allPins = pins();

const transparentPixel = {
  width: 1,
  height: 1,
  data: new Uint8Array([0, 0, 0, 0]),
};

export type PinImageStyle = {
  type: "Pin";
  pin: string | null;
  icon: PinIcon;
  color: string;
};

export type TextImageStyle = {
  type: "Text";
  label: string;
  color: string;
  size: number;
  outlineColor: string | null;
  outlineWidth: number;
  outlineBlur: number;
  width: number;
  height: number;
};

type DynamicImageStyle = PinImageStyle | TextImageStyle;

const parseEventId = (eventId: string): DynamicImageStyle | null => {
  try {
    return JSON.parse(eventId) as DynamicImageStyle;
  } catch (error) {
    console.warn("Could not parse image missing to ImageComponents", eventId, error);
    return null;
  }
};

type MapImageMissingEvent = {
  id: string;
};

export const applyImageMissingHandler = (): void => {
  const map = getMap();

  const onImageMissing = async (event: MapImageMissingEvent) => {
    const style = parseEventId(event.id);
    if (!style) {
      return;
    }

    if (style.type === "Text") {
      const image = generateImageFromText(style);

      map.addImage(event.id, image, { pixelRatio: 2 });
    }

    if (style.type === "Pin") {
      map.addImage(event.id, transparentPixel);

      const image = await generateImage(style);

      if (!image) {
        return;
      }

      map.removeImage(event.id);
      map.addImage(event.id, image, { pixelRatio: 2 });

      // 💩 Manually retriggers a re-render. This is far from ideal and looks glitchy.
      setTimeout(() => {
        getState().entities.forceRerender();
      });
    }
  };

  map.on("styleimagemissing", onImageMissing);
};

export const generateImage = async (style: PinImageStyle): Promise<ImageData | null> => {
  const { component: Pin, dimensions, offset } = allPins[style.pin || "none"];
  const Icon = await findIcon(style.icon.collection, style.icon.name);
  const imgSrc = style.icon.collection === "emoji" ? imgSrcFromEmojiName(style.icon.name) : null;
  if (!Icon) {
    return null;
  }

  const pinWidth = dimensions[0];
  const pinHeight = dimensions[1];
  const iconWidth = 32;
  const iconHeight = 32;
  const scale = 4;

  return new Promise(async (resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = pinWidth * scale;
    canvas.height = pinHeight * scale;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to create canvas 2d context");
    }

    if (Pin) {
      await drawImage(context, {
        svg: <Pin color={style.color} />,
        imgSrc: null,
        width: pinWidth * scale,
        height: pinHeight * scale,
        offsetX: 0,
        offsetY: 0,
      });
    }

    await drawImage(context, {
      svg: <Icon color={style.color} />,
      imgSrc: imgSrc || null,
      width: iconWidth * scale,
      height: iconHeight * scale,
      offsetX: ((pinWidth - iconWidth) / 2) * scale,
      offsetY: offset * scale,
    });

    resolve(context.getImageData(0, 0, pinWidth * scale, pinHeight * scale));
  });
};

export const generateImageFromText = (style: TextImageStyle): ImageData => {
  const width = style.width || 1;
  const height = style.height || 1;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create canvas 2d context");
  }

  context.font = `${style.size}px "system-ui"`;
  context.fillStyle = style.color;
  if (style.outlineColor) {
    context.strokeStyle = style.outlineColor;
  }
  context.lineWidth = style.outlineWidth;

  const lines = style.label.split("\n");

  lines.forEach((line, i) => {
    context.fillText(line, 0, (i + 1) * style.size);
    context.strokeText(line, 0, (i + 1) * style.size);
  });

  return context.getImageData(0, 0, width, height);
};

type DrawImageOptions = {
  svg: ReactElement;
  imgSrc: string | null;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

const drawImage = (context: CanvasRenderingContext2D, options: DrawImageOptions) => {
  return new Promise((resolve) => {
    const image = new Image(options.width, options.height);

    image.onload = () => {
      context.drawImage(image, options.offsetX, options.offsetY, options.width, options.height);

      resolve();
    };

    if (!options.imgSrc) {
      const rawSvg = ReactDOMServer.renderToString(options.svg);
      image.src = `data:image/svg+xml;base64,` + btoa(rawSvg);
    } else {
      image.src = options.imgSrc;
    }
  });
};
