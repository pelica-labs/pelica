import classnames from "classnames";
import { keyBy, mapValues } from "lodash";
import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";

import { StylePreview } from "~/components/saved-maps/StylePreview";
import { Button } from "~/components/ui/Button";
import { PlusIcon } from "~/components/ui/Icon";
import { getState } from "~/core/app";
import { staticImage } from "~/lib/staticImages";
import { Style, styleFromUrl } from "~/map/style";

type StylesResponse = {
  styles: Style[];
};

type Props = {
  value: Style;
  onChange: (value: Style) => void;
};

const IMAGE_SIZE = [230, 122];

export const StyleSelector: React.FC<Props> = ({ value, onChange }) => {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const { data } = useSWR<StylesResponse>("/api/styles");

  const [customStyleUrl, setCustomStyleUrl] = useState<string>("");
  const [customStyleError, setCustomStyleError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!customStyleUrl) {
        setCustomStyleError(null);
        return;
      }

      const style = styleFromUrl(customStyleUrl);
      if (!style || !style.id || !style.owner) {
        throw new Error("This style is invalid");
      }
      onChange(style);
    } catch (error) {
      setCustomStyleError("Please enter a valid style.");
    }
  }, [customStyleUrl]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const {
      map: { coordinates, zoom, bearing, pitch },
    } = getState();

    const styles = data.styles;
    if (value && !styles.find((style) => style.id === value.id)) {
      styles.push(value);
      mutate("/api/styles", { styles }, false);
    }

    const stylesById = keyBy(styles, (style) => style.id);
    const previews = mapValues(stylesById, (style) => {
      return staticImage({
        coordinates,
        zoom,
        bearing,
        pitch,
        style,
        width: IMAGE_SIZE[0] * 2,
        height: IMAGE_SIZE[1] * 2,
      });
    });

    setPreviews(previews);
  }, [data, value]);

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
              "flex flex-col items-stretch p-2 rounded font-medium cursor-pointer hover:bg-orange-100 h-full md:w-full md:h-40 focus:outline-none focus:ring overflow-hidden": true,
              "bg-orange-100 ring": isSelectedStyle,
            })}
            onClick={() => {
              onChange(style);
            }}
          >
            <span className="text-left text-xs  text-gray-800 whitespace-nowrap w-40 md:w-full mb-2 md:mb-0 truncate inline-flex items-baseline">
              <span className="uppercase">{style.name}</span>

              {style.author && (
                <span className="text-gray-500 font-light ml-1 md:ml-auto truncate text-2xs">
                  by{" "}
                  <a
                    className="hover:underline"
                    href={`https://twitter.com/${style.author.twitter}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {style.author.name}
                  </a>
                </span>
              )}
            </span>
            <StylePreview hash={style.hash || null} src={previews[style.id]} />
          </button>
        );
      })}

      <div className="py-8 md:w-full flex items-center justify-center px-4 md:px-0">
        <a
          href="https://github.com/pelica-labs/pelica/issues/new?assignees=sarahmamy&labels=feature&template=style-suggestion.md&title=%5BStyle+suggestion%5D"
          rel="noreferrer"
          target="_blank"
        >
          <Button className="text-xs space-x-1 text-gray-700">
            <PlusIcon className="w-4 h-4" />
            <span>Suggest a style</span>
          </Button>
        </a>
      </div>

      <div className="hidden md:block py-8 md:w-full px-2 p-2">
        <span className="text-left text-xs uppercase text-gray-800 whitespace-nowrap w-40 md:w-full mb-2 md:mb-0 truncate inline-flex items-baseline pb-2">
          Custom style
        </span>
        <span className="text-left text-xs">Paste a public mapbox style url.</span>
        <input
          className="border rounded text-sm py-1 px-2 md:w-full w-48"
          placeholder="mapbox://styles/user/id123"
          value={customStyleUrl}
          onChange={(e) => setCustomStyleUrl(e.target.value)}
        ></input>
        <span className="text-left text-sm text-orange-700 inline-block">{customStyleError}</span>
      </div>
    </div>
  );
};
