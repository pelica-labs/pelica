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
