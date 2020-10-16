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
        size: 256,
      });
    });

    setPreviews(previews);
  }, [data]);

  if (!data) {
    // This won't happen since we provide initial data
    return null;
  }

  return (
    <div className="flex flex-col items-start space-y-1 p-1">
      {data.styles.map((style) => {
        const isSelectedStyle = value.id === style.id;
        const containerClasses = classnames({
          "flex flex-col items-start p-2 rounded font-medium cursor-pointer hover:bg-orange-200 w-full h-40 focus:outline-none focus:shadow-outline": true,
          "bg-orange-300": isSelectedStyle,
        });

        return (
          <button
            key={style.id}
            className={containerClasses}
            onClick={() => {
              onChange(style);
            }}
          >
            <span className="text-xs uppercase text-gray-800  inline-flex whitespace-no-wrap">{style.name}</span>
            <StylePreview src={previews[style.id]} />
          </button>
        );
      })}
    </div>
  );
};
