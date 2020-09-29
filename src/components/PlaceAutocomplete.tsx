import MapboxGeocoding, { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import classnames from "classnames";
import React, { useEffect, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "~/components/Icon";
import { useMap } from "~/components/MapContext";

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error("Missing Mapbox public token");
}

const mapboxGeocoding = MapboxGeocoding({ accessToken });

export const PlaceAutocomplete: React.FC = () => {
  const input = useRef<HTMLInputElement>(null);
  const { state, setPlace } = useMap();
  const [search, setSearch] = useState(state.place?.place_name ?? "");
  const [places, setPlaces] = useState<GeocodeFeature[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [isHoveringResults, setIsHoveringResults] = useState(false);

  /**
   * Keyboard shortcut
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Cmd-P
      if (event.keyCode === 80 && event.metaKey) {
        event.preventDefault();
        input.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown, false);
    return () => {
      window.removeEventListener("keydown", onKeyDown, false);
    };
  }, []);

  /**
   * Perform geocoding query when input changes
   */
  useEffect(() => {
    if (!search || search.length < 3) {
      setPlaces([]);
      return;
    }

    mapboxGeocoding
      .forwardGeocode({ query: search, mode: "mapbox.places" })
      .send()
      .then((res) => {
        setPlaces(res.body.features);
        setSelectionIndex(0);
      });
  }, [search]);

  /**
   * Handles focus & blur to toggle results list
   */
  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = (event: React.FocusEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setTimeout(() => {
      setIsFocused(false);
    }, 300);
  };

  /**
   * Handles keyboard navigation
   */
  const onKeyUp = (event: React.KeyboardEvent) => {
    if (!places.length) {
      return;
    }

    // up
    if (event.keyCode === 38) {
      event.preventDefault();
      event.stopPropagation();
      setSelectionIndex((places.length + selectionIndex - 1) % places.length);
    }

    // down
    if (event.keyCode === 40) {
      event.preventDefault();
      event.stopPropagation();
      setSelectionIndex((selectionIndex + 1) % places.length);
    }

    // enter
    if (event.keyCode === 13) {
      onPlaceSelection(event, places[selectionIndex]);
    }
  };

  /**
   * Handles result selection
   */
  const onPlaceSelection = (event: React.MouseEvent | React.KeyboardEvent, place: GeocodeFeature) => {
    event.preventDefault();
    event.stopPropagation();

    setSearch(place.place_name);
    setPlaces([]);

    setPlace(place);

    setIsFocused(false);
  };

  /**
   * Handles result hover
   */
  const onPlaceHover = (index: number) => {
    setSelectionIndex(index);
  };

  /**
   * Handles selection clear
   */
  const onClearClick = () => {
    setSearch("");
    setPlaces([]);

    setPlace(null);

    input.current?.focus();
  };

  return (
    <div className="relative bg-gray-900 text-gray-200 rounded shadow w-64 flex flex-col">
      {!isFocused && !search.length && <SearchIcon className="absolute left-0 ml-3 mt-4 text-gray-600 w-4 h-4" />}

      <input
        ref={input}
        className="p-2 bg-gray-900 text-gray-200 w-full outline-none border-2 h-12 border-transparent rounded-sm focus:border-green-700"
        type="text"
        value={search}
        onBlur={(event) => onBlur(event)}
        onChange={(event) => setSearch(event.target.value)}
        onFocus={() => onFocus()}
        onKeyUp={(event) => onKeyUp(event)}
      />

      {!!state.place && (
        <button
          className="absolute flex justify-center items-center mt-3 mr-2 right-0 bg-gray-900 hover:bg-gray-800 outline-none rounded-full w-6 h-6 text-gray-600"
          onClick={() => onClearClick()}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      )}

      {isFocused && (
        <ul
          className="flex flex-col text-sm"
          onMouseEnter={() => setIsHoveringResults(true)}
          onMouseLeave={() => setIsHoveringResults(false)}
        >
          {places.map((place, index) => {
            const isKeyboardSelected = selectionIndex === index;
            const linkClasses = classnames({
              "block px-2 py-2 cursor-pointer border-b border-gray-700 hover:bg-green-900": true,
              "bg-green-900": !isHoveringResults && isKeyboardSelected,
            });

            return (
              <li key={place.id}>
                <a
                  className={linkClasses}
                  onClick={(event) => onPlaceSelection(event, place)}
                  onMouseEnter={() => onPlaceHover(index)}
                >
                  {place.place_name}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
