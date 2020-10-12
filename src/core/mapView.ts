import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { debounce } from "lodash";

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

  place: GeocodeFeature | null;

  features: GeocodeFeature[];
};

const initialState: MapView = {
  coordinates: {
    latitude: 48.856614,
    longitude: 2.3522219,
  },

  zoom: 9,
  bearing: 0,
  pitch: 0,

  place: null,

  features: [],
};

export const mapView = ({ mutate }: App) => ({
  ...initialState,

  move: (coordinates: Coordinates, zoom: number, bearing: number, pitch: number) => {
    mutate(({ mapView }) => {
      mapView.coordinates = coordinates;
      mapView.zoom = zoom;
      mapView.bearing = bearing;
      mapView.pitch = pitch;
    });
  },

  updateFeatures: debounce(async (coordinates: Coordinates) => {
    const res = await mapboxGeocoding
      .reverseGeocode({
        query: [coordinates.longitude, coordinates.latitude],
        mode: "mapbox.places",
        types: ["place"],
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
