import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import classnames from "classnames";
import React, { useEffect, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "~/components/Icon";
import { useLocalStorage } from "~/lib/localStorage";
import { mapboxGeocoding } from "~/lib/mapbox";
import { useStore } from "~/lib/state";

export const PlaceAutocomplete: React.FC = () => {
  const input = useRef<HTMLInputElement>(null);
  const place = useStore((store) => store.place);
  const dispatch = useStore((store) => store.dispatch);
  const [search, setSearch] = useState(place?.place_name ?? "");
  const [places, setPlaces] = useState<GeocodeFeature[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useLocalStorage<GeocodeFeature[]>("recentSearches", []);

  const showRecentSearches = !search;
  const results = showRecentSearches ? recentSearches : places;

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
    input.current?.focus();
  };

  const onBlur = (event: React.FocusEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    input.current?.blur();

    setTimeout(() => {
      setIsFocused(false);
    }, 300);
  };

  /**
   * Handles keyboard navigation
   */
  const onKeyUp = (event: React.KeyboardEvent) => {
    // escape
    if (event.keyCode === 27) {
      onBlur(event);
    }

    if (!results.length) {
      return;
    }

    // up
    if (event.keyCode === 38) {
      event.preventDefault();
      event.stopPropagation();
      setSelectionIndex((results.length + selectionIndex - 1) % results.length);
    }

    // down
    if (event.keyCode === 40) {
      event.preventDefault();
      event.stopPropagation();
      setSelectionIndex((selectionIndex + 1) % results.length);
    }

    // enter
    if (event.keyCode === 13) {
      onPlaceSelection(event, results[selectionIndex]);
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

    const placeIndexInRecentSearches = recentSearches.findIndex((search) => search.id === place.id);
    if (placeIndexInRecentSearches >= 0) {
      recentSearches.splice(placeIndexInRecentSearches, 1);
    }
    recentSearches.unshift(place);
    setRecentSearches(recentSearches.slice(0, 5));

    dispatch.setPlace(place);

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

    dispatch.setPlace(null);

    input.current?.focus();
  };

  const containerClasses = classnames({
    "relative bg-gray-900 text-gray-200 shadow flex flex-col transition-all duration-100 ease-in-out cursor-pointer": true,
    "w-64 rounded": isFocused || search,
    "w-12 rounded-full ": !(isFocused || search),
  });

  return (
    <div className={containerClasses} onClick={() => onFocus()}>
      {!isFocused && !search.length && <SearchIcon className="absolute left-0 ml-3 mt-3 text-gray-600 w-6 h-6" />}

      <input
        ref={input}
        className="p-2 bg-transparent text-gray-200 w-full outline-none border-2 h-12 border-transparent cursor-pointer rounded-sm focus:border-green-700"
        type="text"
        value={search}
        onBlur={(event) => onBlur(event)}
        onChange={(event) => setSearch(event.target.value)}
        onFocus={() => onFocus()}
        onKeyUp={(event) => onKeyUp(event)}
      />

      {!!place && (
        <button
          className="absolute flex justify-center items-center mt-3 mr-2 right-0 bg-gray-900 hover:bg-gray-800 outline-none rounded-full w-6 h-6 text-gray-600"
          onClick={() => onClearClick()}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      )}

      {isFocused && (
        <ul className="flex flex-col text-sm">
          {showRecentSearches && recentSearches.length > 0 && (
            <span className="p-2 text-xs text-gray-500 uppercase tracking-wide leading-none">Recent searches</span>
          )}

          {results.map((place, index) => {
            const isKeyboardSelected = selectionIndex === index;
            const linkClasses = classnames({
              "block px-2 py-2 cursor-pointer border-b border-gray-700 hover:bg-green-900": true,
              "bg-green-900": isKeyboardSelected,
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
