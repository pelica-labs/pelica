import { ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

export const generateImage = (component: ReactElement): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const svg = ReactDOMServer.renderToString(component);

    const image = new Image(54, 73);
    image.src = `data:image/svg+xml;base64,` + btoa(svg);

    image.onload = () => {
      resolve(getImageData(image));
    };

    image.onerror = (err) => {
      reject(err);
    };
  });
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
