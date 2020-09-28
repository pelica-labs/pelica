import MapboxClient from "@mapbox/mapbox-sdk";
import MapboxGeocoding, { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import SearchIcon from "@material-ui/icons/SearchOutlined";
import classnames from "classnames";
import React, { useEffect, useRef, useState } from "react";

const mapbox = MapboxClient({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN });

const mapboxGeocoding = MapboxGeocoding(mapbox);

type Props = {
  value?: GeocodeFeature;
  onChange: (place?: GeocodeFeature) => void;
};

export const PlaceAutocomplete: React.FC<Props> = ({ value, onChange }) => {
  const input = useRef<HTMLInputElement>();
  const [search, setSearch] = useState(value?.place_name ?? "");
  const [places, setPlaces] = useState<GeocodeFeature[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [isHoveringResults, setIsHoveringResults] = useState(false);

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

  const onBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
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
      onPlaceSelection(places[selectionIndex]);
    }
  };

  /**
   * Handles result selection
   */
  const onPlaceSelection = (place: GeocodeFeature) => {
    setSearch(place.place_name);
    setPlaces([]);

    onChange(place);

    input.current.blur();
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

    input.current.focus();
  };

  return (
    <div className="relative bg-white rounded shadow w-64 flex flex-col">
      {!isFocused && !search.length && (
        <SearchIcon fontSize="small" className="absolute left-0 ml-3 mt-3 text-gray-600" />
      )}

      <input
        ref={input}
        type="text"
        value={search}
        onKeyUp={(event) => onKeyUp(event)}
        onFocus={() => onFocus()}
        onBlur={() => onBlur()}
        onChange={(event) => setSearch(event.target.value)}
        className="p-2 w-full outline-none border-2 border-transparent rounded-sm focus:border-green-500"
      />

      {!!value && (
        <button
          className="absolute flex justify-center items-center leading-none mt-2 mr-1 right-0 bg-white hover:bg-gray-100 rounded-full w-6 h-6 text-gray-600"
          onClick={() => onClearClick()}
        >
          ×
        </button>
      )}

      {isFocused && places.length > 0 && (
        <ul
          className="flex flex-col text-sm"
          onMouseEnter={() => setIsHoveringResults(true)}
          onMouseLeave={() => setIsHoveringResults(false)}
        >
          {places.map((place, index) => {
            const isKeyboardSelected = selectionIndex === index;
            const linkClasses = classnames({
              "block px-2 py-2 cursor-pointer border-b border-gray-200 hover:bg-green-300": true,
              "bg-green-300": !isHoveringResults && isKeyboardSelected,
            });

            return (
              <li key={place.id}>
                <a
                  className={linkClasses}
                  onClick={() => onPlaceSelection(place)}
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
