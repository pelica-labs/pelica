import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { throttle } from "lodash";

import { Coordinates } from "~/core/geometries";
import { App } from "~/core/helpers";
import { Place } from "~/core/itineraries";
import { mapboxGeocoding } from "~/lib/mapbox";

export type MapView = {
  coordinates: Coordinates;

  zoom: number;
  bearing: number;
  pitch: number;

  bounds: [Coordinates, Coordinates] | null;

  place: Place | null;

  features: GeocodeFeature[];
};

const initialState: MapView = {
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

export const mapView = ({ mutate }: App) => ({
  ...initialState,

  move: (
    coordinates: Coordinates,
    zoom: number,
    bearing: number,
    pitch: number,
    bounds?: [Coordinates, Coordinates]
  ) => {
    mutate(({ mapView }) => {
      mapView.coordinates = coordinates;
      mapView.zoom = zoom;
      mapView.bearing = bearing;
      mapView.pitch = pitch;

      if (bounds) {
        mapView.bounds = bounds;
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

    mutate(({ mapView }) => {
      mapView.features = res.body.features;
    });
  }, 2000),

  setPlace: (place: Place | null) => {
    mutate(({ mapView }) => {
      mapView.place = place;
    });
  },

  resetOrientation: () => {
    mutate(({ mapView }) => {
      mapView.bearing = 0;
    });

    setTimeout(() => {
      mutate(({ mapView }) => {
        mapView.pitch = 0;
      });
    });
  },
});
