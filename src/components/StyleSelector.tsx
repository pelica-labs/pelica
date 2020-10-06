import classnames from "classnames";
import { keyBy, mapValues } from "lodash";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

import { StylePreview } from "~/components/StylePreview";
import { staticImage } from "~/lib/export";
import { useStore } from "~/lib/state";
import { defaultStyle, Style } from "~/lib/style";

type StylesResponse = {
  styles: Style[];
};

type Props = {
  value: Style;
  onChange: (value: Style) => void;
};

export const StyleSelector: React.FC<Props> = ({ value, onChange }) => {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const { data } = useSWR<StylesResponse>("/api/styles", {
    revalidateOnMount: true,
    initialData: {
      styles: [defaultStyle],
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const { coordinates, zoom, bearing, pitch } = useStore.getState();

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
    <div className="bg-gray-900 text-white rounded shadow flex flex-col p-1">
      <div className="flex flex-row flex-wrap max-w-xl">
        {data.styles.map((style) => {
          const isSelectedStyle = value.id === style.id;
          const containerClasses = classnames({
            "flex flex-col items-center p-2 rounded font-medium cursor-pointer hover:bg-green-900": true,
            "bg-green-700": isSelectedStyle,
          });

          return (
            <div
              key={style.id}
              className={containerClasses}
              onClick={() => {
                onChange(style);
              }}
            >
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
