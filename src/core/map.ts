import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { BBox, Position } from "@turf/turf";
import { throttle } from "lodash";

import { App } from "~/core/helpers";
import { Place } from "~/core/itineraries";
import { mapboxGeocoding } from "~/lib/mapbox";

export type Map = {
  coordinates: Position;

  zoom: number;
  bearing: number;
  pitch: number;

  bounds: BBox | null;

  place: Place | null;

  features: GeocodeFeature[];
};

export const mapInitialState: Map = {
  coordinates: [2.3522219, 48.856614],

  bounds: null,

  zoom: 9,
  bearing: 0,
  pitch: 0,

  place: null,

  features: [],
};

export const map = ({ mutate }: App) => ({
  ...mapInitialState,

  move: (coordinates: Position, zoom: number, bearing: number, pitch: number) => {
    mutate(({ map }) => {
      map.coordinates = coordinates;
      map.zoom = zoom;
      map.bearing = bearing;
      map.pitch = pitch;
    });
  },

  setBounds(bounds: BBox) {
    mutate((state) => {
      state.map.bounds = bounds;
    });
  },

  updateFeatures: throttle(async (coordinates: Position) => {
    const res = await mapboxGeocoding
      .reverseGeocode({
        query: coordinates as [number, number],
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
