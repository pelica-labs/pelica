import { Style } from "@mapbox/mapbox-sdk/services/styles";
import classnames from "classnames";
import { keyBy, mapValues } from "lodash";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

import { StylePreview } from "~/components/StylePreview";
import { staticImage } from "~/lib/mapbox";
import { useStore } from "~/lib/state";

type StylesResponse = {
  styles: Style[];
};

export const StyleSelector: React.FC = () => {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const selectedStyle = useStore((store) => store.style);
  const dispatch = useStore((store) => store.dispatch);
  const { data } = useSWR<StylesResponse>("/api/styles");

  useEffect(() => {
    if (!data) {
      return;
    }

    const { coordinates, zoom } = useStore.getState();

    const stylesById = keyBy(data.styles, (style) => style.id);
    const previews = mapValues(stylesById, (style) => {
      return staticImage({
        coordinates,
        zoom,
        style,
        size: 256,
      });
    });

    setPreviews(previews);
  }, [data]);

  if (!data) {
    // @todo spinner
    return null;
  }

  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col p-1">
      <div className="flex flex-row flex-wrap max-w-xl">
        {data.styles.map((style) => {
          const isSelectedStyle = selectedStyle?.id === style.id;
          const containerClasses = classnames({
            "flex flex-col items-center p-2 rounded font-medium cursor-pointer hover:bg-green-900": true,
            "bg-green-700": isSelectedStyle,
          });

          return (
            <div key={style.id} className={containerClasses} onClick={() => dispatch.setStyle(style)}>
              <span className="text-xs uppercase text-gray-200 w-32 inline-flex overflow-x-hidden whitespace-no-wrap">
                {style.name}
              </span>
              <StylePreview src={previews[style.id]} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
