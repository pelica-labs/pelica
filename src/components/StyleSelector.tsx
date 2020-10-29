import classnames from "classnames";
import { keyBy, mapValues } from "lodash";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

import { StylePreview } from "~/components/StylePreview";
import { getState } from "~/core/app";
import { staticImage } from "~/lib/staticImages";
import { Style } from "~/lib/style";

type StylesResponse = {
  styles: Style[];
};

type Props = {
  value: Style;
  onChange: (value: Style) => void;

  initialStyles: Style[];
};

const IMAGE_SIZE = [230, 122];

export const StyleSelector: React.FC<Props> = ({ value, onChange, initialStyles }) => {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const { data } = useSWR<StylesResponse>("/api/styles", {
    revalidateOnMount: true,
    initialData: {
      styles: initialStyles,
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const {
      map: { coordinates, zoom, bearing, pitch },
    } = getState();

    const stylesById = keyBy(data.styles, (style) => style.id);
    const previews = mapValues(stylesById, (style) => {
      return staticImage({
        coordinates,
        zoom,
        bearing,
        pitch,
        style,
        width: IMAGE_SIZE[0],
        height: IMAGE_SIZE[1],
      });
    });

    setPreviews(previews);
  }, [data]);

  if (!data) {
    // This won't happen since we provide initial data
    return null;
  }

  return (
    <div className="flex space-x-1 md:space-x-0 md:p-1 md:flex-col md:items-start md:space-y-1 justify-between overflow-x-auto h-full">
      {data.styles.map((style) => {
        const isSelectedStyle = value.id === style.id;

        return (
          <button
            key={style.id}
            className={classnames({
              "flex flex-col items-stretch p-2 rounded font-medium cursor-pointer hover:bg-orange-100 h-full md:w-full md:h-40 focus:outline-none focus:shadow-outline overflow-hidden": true,
              "bg-orange-100 shadow-outline": isSelectedStyle,
            })}
            onClick={() => {
              onChange(style);
            }}
          >
            <span className="block text-left text-xs uppercase text-gray-800 whitespace-no-wrap w-40 md:w-full mb-2 md:mb-0">
              {style.name}
            </span>
            <StylePreview hash={style.hash || null} src={previews[style.id]} />
          </button>
        );
      })}
    </div>
  );
};
