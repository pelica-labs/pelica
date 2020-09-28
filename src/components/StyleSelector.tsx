import { Style } from "@mapbox/mapbox-sdk/services/styles";
import classnames from "classnames";
import React from "react";
import useSWR from "swr";

import { Map } from "./Map";

type Props = {
  value: Style | null;
  onChange: (style: Style) => void;
};

type StylesResponse = {
  styles: Style[];
};

export const StyleSelector: React.FC<Props> = ({ value, onChange }) => {
  const { data } = useSWR<StylesResponse>("/api/styles");

  if (!data) {
    // @todo spinner
    return null;
  }

  return (
    <div className="bg-gray-900 text-white rounded shadow flex flex-col p-2 pt-1">
      <h3 className="uppercase">Pick a style</h3>
      <div className="flex mt-2 space-x-1">
        {data.styles.map((style) => {
          const isSelectedStyle = value?.id === style.id;
          const containerClasses = classnames({
            "flex flex-col pt-2 pb-1 px-2 rounded font-medium cursor-pointer hover:bg-green-900": true,
            "bg-green-700": isSelectedStyle,
          });

          return (
            <div key={style.id} onClick={() => onChange(style)} className={containerClasses}>
              <div className="w-24 h-24 border border-gray-700">
                <Map selectedStyle={style} />
              </div>
              <span className="mt-1 text-xs uppercase text-gray-200 w-24 inline-flex overflow-x-hidden whitespace-no-wrap">
                {style.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
