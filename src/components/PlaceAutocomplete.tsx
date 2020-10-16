import { GeocodeResponse } from "@mapbox/mapbox-sdk/services/geocoding";
import classNames from "classnames";
import * as KeyCode from "keycode-js";
import React, { useEffect, useRef, useState } from "react";

import { CloseIcon, Icon, SearchIcon } from "~/components/Icon";
import { Coordinates } from "~/core/geometries";
import { Place } from "~/core/itineraries";
import { useAsyncStorage } from "~/hooks/useAsyncStorage";
import { mapboxGeocoding } from "~/lib/mapbox";

type Props = {
  value: Place | null;
  onChange: (value: Place | null) => void;

  bias?: Coordinates;
  collapsesWhenEmpty?: boolean;
  clearable?: boolean;
  dense?: boolean;
  leftIcon?: Icon | null;
  placeholder?: string;
  excludeRecentSearches?: Place[];
};

const MAX_RECENT_SEARCHES = 5;

export const PlaceAutocomplete: React.FC<Props> = ({
  value,
  onChange,

  bias,
  collapsesWhenEmpty = false,
  dense = false,
  clearable = true,
  leftIcon: LeftIcon = SearchIcon,
  placeholder,
  excludeRecentSearches = [],
}) => {
  const input = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState(value?.name ?? "");
  const [places, setPlaces] = useState<Place[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useAsyncStorage<Place[]>("recentSearches", []);

  const showRecentSearches = !search;
  const results = showRecentSearches
    ? recentSearches
        .filter((search) => !excludeRecentSearches.find((recentSearch) => recentSearch.id === search.id))
        .slice(0, MAX_RECENT_SEARCHES)
    : places;

  /**
   * Keyboard shortcut
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.keyCode === KeyCode.KEY_P) {
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
      .forwardGeocode({
        query: search,
        mode: "mapbox.places",
        ...(bias && { proximity: [bias.longitude, bias.latitude] }),
      })
      .send()
      .then((res) => {
        const places = res.body as GeocodeResponse;

        setPlaces(
          places.features.map((feature) => {
            return {
              ...feature,
              type: "Feature",
              name: feature.place_name,
            };
          })
        );
        setSelectionIndex(0);
      });
  }, [search]);

  /**
   * Handles focus & blur to toggle results list
   */
  const onFocus = () => {
    setIsFocused(true);
    input.current?.focus();

    if (value?.type === "Coordinates") {
      input.current?.select();
    }
  };

  const onBlur = (event?: React.FocusEvent | React.KeyboardEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    input.current?.blur();

    // @todo: this triggers a react state update warning
    setTimeout(() => {
      setIsFocused(false);
    }, 300);
  };

  /**
   * Handles keyboard navigation
   */
  const onKeyUp = (event: React.KeyboardEvent) => {
    if (event.keyCode === KeyCode.KEY_ESCAPE) {
      onBlur(event);
    }

    if (!results.length) {
      return;
    }

    // up
    if (event.keyCode === KeyCode.KEY_UP) {
      event.preventDefault();
      event.stopPropagation();
      setSelectionIndex((results.length + selectionIndex - 1) % results.length);
    }

    // down
    if (event.keyCode === KeyCode.KEY_DOWN) {
      event.preventDefault();
      event.stopPropagation();
      setSelectionIndex((selectionIndex + 1) % results.length);
    }

    // enter
    if (event.keyCode === KeyCode.KEY_RETURN) {
      onPlaceSelection(event, results[selectionIndex]);
    }
  };

  /**
   * Handles result selection
   */
  const onPlaceSelection = (event: React.MouseEvent | React.KeyboardEvent, place: Place) => {
    event.preventDefault();
    event.stopPropagation();

    setSearch(collapsesWhenEmpty ? place.name : "");
    setPlaces([]);

    const placeIndexInRecentSearches = recentSearches.findIndex((search) => search.id === place.id);
    if (placeIndexInRecentSearches >= 0) {
      recentSearches.splice(placeIndexInRecentSearches, 1);
    }
    recentSearches.unshift(place);
    setRecentSearches(recentSearches.slice(0, MAX_RECENT_SEARCHES + 1));

    onChange(place);

    onBlur();
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

    onChange(null);

    input.current?.focus();
  };

  return (
    <button
      className={classNames({
        "group relative bg-white border text-gray-800 shadow flex flex-col transition-all duration-100 ease-in-out cursor-pointer": true,
        ...(collapsesWhenEmpty && {
          "w-56 rounded-lg": isFocused || search,
          "w-12 rounded-full": !(isFocused || search),
        }),
        ...(!collapsesWhenEmpty && {
          "w-56 rounded": true,
        }),
      })}
      onClick={() => onFocus()}
    >
      {!!LeftIcon && !isFocused && !search.length && (
        <LeftIcon className="absolute left-0 ml-3 mt-3 text-gray-700 w-6 h-6 group-hover:text-orange-600" />
      )}

      <input
        ref={input}
        className={classNames({
          "p-2 bg-transparent text-gray-800 w-full outline-none border-2 border-transparent cursor-pointer rounded focus:border-orange-100 placeholder-opacity-50": true,
          "text-gray-600 text-xs": value?.type === "Coordinates",
          "h-8 text-sm": dense && value?.type !== "Coordinates",
          "h-12 text-sm": !dense && value?.type !== "Coordinates",
        })}
        placeholder={placeholder}
        type="text"
        value={search}
        onBlur={(event) => onBlur(event)}
        onChange={(event) => setSearch(event.target.value)}
        onFocus={() => onFocus()}
        onKeyUp={(event) => onKeyUp(event)}
      />

      {clearable && !!value && (
        <button
          className="absolute flex justify-center items-center mt-3 mr-2 right-0 bg-gray-300 hover:bg-gray-200 outline-none rounded-full w-6 h-6 text-gray-700"
          onClick={() => onClearClick()}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      )}

      {isFocused && (
        <ul
          className={classNames({
            "absolute left-0 right-0 flex flex-col text-sm bg-white z-10 rounded border shadow": true,
            "mt-8": dense,
            "mt-12": !dense,
          })}
        >
          {showRecentSearches && results.length > 0 && (
            <span className="p-2 text-xs text-gray-600 uppercase tracking-wide leading-none border-b">
              Recent searches
            </span>
          )}

          {results.map((place, index) => {
            const isKeyboardSelected = selectionIndex === index;

            return (
              <li key={place.id}>
                <a
                  className={classNames({
                    "w-full text-left block px-2 py-2 cursor-pointer border-b hover:bg-orange-200 text-xs": true,
                    "bg-orange-200": isKeyboardSelected,
                  })}
                  onClick={(event) => onPlaceSelection(event, place)}
                  onMouseEnter={() => onPlaceHover(index)}
                >
                  {place.name}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </button>
  );
};
