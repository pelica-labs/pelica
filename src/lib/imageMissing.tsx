import React from "react";

import { FireIcon, TargetIcon } from "~/components/Icon";
import { Pin } from "~/components/Pin";
import { generateImage, generatePlaceholder } from "~/lib/generateImage";

const PrefixToComponent = {
  pin: Pin,

  fire: FireIcon,
  target: TargetIcon,
};

type MapImageMissingEvent = {
  id: string;
};

export const applyImageMissingHandler = (map: mapboxgl.Map): void => {
  const onImageMissing = (event: MapImageMissingEvent) => {
    const parts = event.id.split("-");

    const prefix = parts[0] as keyof typeof PrefixToComponent;
    const color = parts[1];

    const Component = PrefixToComponent[prefix];

    generateImage(<Component color={color} />).then((image) => {
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
