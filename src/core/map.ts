import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { BBox, Position } from "@turf/turf";
import { throttle } from "lodash";

import { App } from "~/core/helpers";
import { Place } from "~/core/itineraries";
import { getMap } from "~/core/selectors";
import { mapboxGeocoding } from "~/lib/mapbox";

export type Map = {
  current: mapboxgl.Map | null;

  coordinates: Position;

  zoom: number;
  bearing: number;
  pitch: number;

  bounds: BBox | null;

  place: Place | null;

  features: GeocodeFeature[];

  canvas: {
    width: number;
    height: number;
  };
};

export const mapInitialState: Map = {
  current: null,

  coordinates: [2.3522219, 48.856614],

  bounds: null,

  zoom: 9,
  bearing: 0,
  pitch: 0,

  place: null,

  features: [],

  canvas: {
    width: 1200,
    height: 800,
  },
};

export const map = ({ mutate, get }: App) => ({
  ...mapInitialState,

  initialize: (map: mapboxgl.Map) => {
    mutate((state) => {
      state.map.current = map;
    });

    get().map.updateCanvasSize();
  },

  move: (coordinates: Position, zoom: number, bearing: number, pitch: number) => {
    mutate((state) => {
      state.map.coordinates = coordinates;
      state.map.zoom = zoom;
      state.map.bearing = bearing;
      state.map.pitch = pitch;
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

  updateCanvasSize: () => {
    mutate((state) => {
      const canvas = getMap(state).getCanvas();

      state.map.canvas.width = canvas.width;
      state.map.canvas.height = canvas.height;
    });
  },
});
