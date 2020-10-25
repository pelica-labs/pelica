import { Position } from "@turf/turf";
import { MercatorCoordinate } from "mapbox-gl";

import { nextEntityId } from "~/core/entities";
import { App } from "~/core/helpers";
import { getSelectedEntity, getSelectedPins } from "~/core/selectors";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export const MAX_PIN_SIZE = 12;

export type Pin = {
  id: number;
  source: MapSource;
  type: "Pin";
  coordinates: Position;
  style: {
    color: string;
    width: number;
    icon: string;
    target?: "Pin";
  };
  transientStyle?: {
    color: string;
    width: number;
  };
};

export type PinStyle = {
  icon: string;
  width: number;
  color: string;
};

export type Pins = {
  style: PinStyle;
};

const initialState: Pins = {
  style: {
    icon: "star",
    width: 6,
    color: theme.colors.yellow[500],
  },
};

export const pins = ({ mutate, get }: App) => ({
  ...initialState,

  setStyle: (style: Partial<PinStyle>) => {
    mutate((state) => {
      Object.assign(state.pins.style, style);

      const selectedEntity = getSelectedEntity(state);
      if (selectedEntity?.type === "Pin") {
        Object.assign(selectedEntity.style, style);
      }
    });
  },

  place: (coordinates: Position) => {
    const pinId = nextEntityId();

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

  editSelectedPinCoordinates: (coordinates: Position) => {
    mutate((state) => {
      const selectedPin = getSelectedEntity(state) as Pin;

      selectedPin.coordinates = coordinates;
    });
  },

  endEditSelectedPinCoordinates: (coordinates: Position) => {
    const selectedPin = getSelectedEntity(get()) as Pin;

    get().history.push({
      name: "movePin",
      pinId: selectedPin.id,
      coordinates,
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
