export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [headers, data] = dataUrl.split(";");
  const [, contentType] = headers.split(":");
  const [, base64Data] = data.split(",");

  const bytes = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < bytes.length; offset += 512) {
    const slice = bytes.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

export const dataUrlToImageData = (dataUrl: string): Promise<ImageData> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const image = new Image();

    image.addEventListener("load", () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    });

    image.src = dataUrl;
  });
};
