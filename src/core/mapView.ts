import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { throttle } from "lodash";
import { LngLatBounds } from "mapbox-gl";

import { Coordinates } from "~/core/geometries";
import { App } from "~/core/helpers";
import { mapboxGeocoding } from "~/lib/mapbox";

export type MapView = {
  coordinates: {
    latitude: number;
    longitude: number;
  };

  zoom: number;
  bearing: number;
  pitch: number;

  bounds: LngLatBounds | null;

  place: GeocodeFeature | null;

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

  move: (coordinates: Coordinates, zoom: number, bearing: number, pitch: number, bounds: LngLatBounds) => {
    mutate(({ mapView }) => {
      mapView.coordinates = coordinates;
      mapView.zoom = zoom;
      mapView.bearing = bearing;
      mapView.pitch = pitch;
      mapView.bounds = bounds;
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

  setPlace: (place: GeocodeFeature | null) => {
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
