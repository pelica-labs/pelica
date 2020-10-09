import React from "react";

import { Pin } from "~/components/Pin";
import { generateImage, generatePlaceholder } from "~/lib/generateImage";

type MapImageMissingEvent = {
  id: string;
};

export const applyImageMissingHandler = (map: mapboxgl.Map): void => {
  const onImageMissing = (event: MapImageMissingEvent) => {
    const [, imageColor] = event.id.split("-");

    generateImage(<Pin color={imageColor} />).then((image) => {
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
