import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { throttle } from "lodash";

import { Coordinates } from "~/core/geometries";
import { App } from "~/core/helpers";
import { Place } from "~/core/itineraries";
import { mapboxGeocoding } from "~/lib/mapbox";

export type Map = {
  coordinates: Coordinates;

  zoom: number;
  bearing: number;
  pitch: number;

  bounds: [Coordinates, Coordinates] | null;

  place: Place | null;

  features: GeocodeFeature[];
};

const initialState: Map = {
  coordinates: {
    latitude: 48.856614,
    longitude: 2.3522219,
  },

  bounds: null,

  zoom: 9,
  bearing: 0,
  pitch: 0,

  place: null,

  features: [],
};

export const map = ({ mutate }: App) => ({
  ...initialState,

  move: (
    coordinates: Coordinates,
    zoom: number,
    bearing: number,
    pitch: number,
    bounds?: [Coordinates, Coordinates]
  ) => {
    mutate(({ map }) => {
      map.coordinates = coordinates;
      map.zoom = zoom;
      map.bearing = bearing;
      map.pitch = pitch;

      if (bounds) {
        map.bounds = bounds;
      }
    });
  },

  updateFeatures: throttle(async (coordinates: Coordinates) => {
    const res = await mapboxGeocoding
      .reverseGeocode({
        query: [coordinates.longitude, coordinates.latitude],
        mode: "mapbox.places",
      })
      .send();

    mutate(({ map }) => {
      map.features = res.body.features;
    });
  }, 2000),

  setPlace: (place: Place | null) => {
    mutate(({ map }) => {
      map.place = place;
    });
  },

  resetOrientation: () => {
    mutate(({ map }) => {
      map.bearing = 0;
    });

    setTimeout(() => {
      mutate(({ map }) => {
        map.pitch = 0;
      });
    });
  },
});
