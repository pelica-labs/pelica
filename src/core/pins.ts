import { Position } from "@turf/turf";
import { MercatorCoordinate } from "mapbox-gl";

import { App } from "~/core/helpers";
import { getSelectedEntity, getSelectedPins } from "~/core/selectors";
import { ID, numericId } from "~/lib/id";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export const MIN_PIN_SIZE = 1;
export const MAX_PIN_SIZE = 12;

export type Pin = {
  id: ID;
  source: MapSource;
  type: "Pin";
  coordinates: Position;
  style: PinStyle & {
    target?: "Pin";
  };
  transientStyle?: PinStyle;
};

export type PinIcon = { collection: string; name: string };

export type PinStyle = {
  icon: PinIcon;
  pinType: string | null;
  width: number;
  color: string;
};

export type Pins = {
  style: PinStyle;
  nextPoint: Position | null;
};

export const pinsInitialState: Pins = {
  style: {
    icon: { collection: "default", name: "star" },
    pinType: "pelipin",
    width: 4,
    color: theme.colors.yellow[500],
  },
  nextPoint: null,
};

export const pins = ({ mutate, get }: App) => ({
  ...pinsInitialState,

  setStyle: (style: Partial<PinStyle>) => {
    mutate((state) => {
      Object.assign(state.pins.style, style);
    });
  },

  updateNextPoint: (coordinates: Position | null) => {
    mutate((state) => {
      state.pins.nextPoint = coordinates;
    });
  },

  place: (coordinates: Position) => {
    const pinId = numericId();

    get().history.push({
      name: "pin",
      point: {
        type: "Pin",
        id: pinId,
        source: MapSource.Pins,
        coordinates,
        style: get().pins.style,
      },
    });

    get().selection.selectEntity(pinId);
  },

  transientUpdateSelectedPin: (style: Partial<PinStyle>) => {
    mutate((state) => {
      getSelectedPins(state).forEach((pin) => {
        if (!pin.transientStyle) {
          pin.transientStyle = pin.style;
        }

        Object.assign(pin.transientStyle, style);
      });
    });
  },

  updateSelectedPin: (style: Partial<PinStyle>) => {
    mutate((state) => {
      getSelectedPins(state).forEach((pin) => {
        delete pin.transientStyle;
      });
    });

    const selectedPins = getSelectedPins(get());
    get().history.push({
      name: "updatePin",
      pinIds: selectedPins.map((pin) => pin.id),
      style,
    });
  },

  nudgeSelectedPin: (direction: Position) => {
    const selectedPin = getSelectedEntity(get()) as Pin;

    const pointCoordinates = MercatorCoordinate.fromLngLat(selectedPin.coordinates as [number, number], 0);
    const base = 2 ** (-get().map.zoom - 1);
    pointCoordinates.x += base * direction[0];
    pointCoordinates.y += base * direction[1];

    get().history.push({
      name: "movePin",
      pinId: selectedPin.id,
      coordinates: pointCoordinates.toLngLat().toArray(),
    });
  },
});
