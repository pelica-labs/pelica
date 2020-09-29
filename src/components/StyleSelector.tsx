import { Style } from "@mapbox/mapbox-sdk/services/styles";
import classnames from "classnames";
import React from "react";
import useSWR from "swr";

import { Map } from "~/components/Map";
import { useMap } from "~/components/MapContext";

type StylesResponse = {
  styles: Style[];
};

export const StyleSelector: React.FC = () => {
  const { state, setStyle } = useMap();
  const { data } = useSWR<StylesResponse>("/api/styles");

  if (!data) {
    // @todo spinner
    return null;
  }

  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col p-2 pt-1">
      <div className="flex flex-row flex-wrap max-w-lg">
        {data.styles.map((style) => {
          const isSelectedStyle = state.style?.id === style.id;
          const containerClasses = classnames({
            "flex flex-col items-center p-2 mb-1 rounded font-medium cursor-pointer hover:bg-green-900 w-1/3": true,
            "bg-green-700": isSelectedStyle,
          });

          return (
            <div key={style.id} className={containerClasses} onClick={() => setStyle(style)}>
              <span className="text-xs uppercase text-gray-200 w-32 inline-flex overflow-x-hidden whitespace-no-wrap">
                {style.name}
              </span>
              <div className="w-32 h-32 mt-1 border border-gray-700">
                <Map disableInteractions disableSync style={style} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
