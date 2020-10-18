import { MercatorCoordinate } from "mapbox-gl";

import { Coordinates, nextGeometryId, Point, Position } from "~/core/geometries";
import { App } from "~/core/helpers";
import { getSelectedGeometry, getSelectedPins } from "~/core/selectors";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

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
    icon: "fire",
    width: 6,
    color: theme.colors.yellow[500],
  },
};

export const pins = ({ mutate, get }: App) => ({
  ...initialState,

  setStyle: (style: Partial<PinStyle>) => {
    const selectedGeometry = getSelectedGeometry(get());

    mutate((state) => {
      Object.assign(state.pins.style, style);

      if (selectedGeometry?.type === "Point") {
        Object.assign(selectedGeometry.style, style);
      }
    });
  },

  place: (latitude: number, longitude: number) => {
    const pinId = nextGeometryId();

    get().history.push({
      name: "pin",
      point: {
        type: "Point",
        id: pinId,
        source: MapSource.Pins,
        coordinates: { latitude, longitude },
        style: get().pins.style,
      },
    });

    get().selection.selectGeometry(pinId);
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

  editSelectedPinCoordinates: (coordinates: Coordinates) => {
    mutate((state) => {
      const selectedPin = getSelectedGeometry(state) as Point;

      selectedPin.coordinates = coordinates;
    });
  },

  endEditSelectedPinCoordinates: (coordinates: Coordinates) => {
    const selectedPin = getSelectedGeometry(get()) as Point;

    get().history.push({
      name: "movePin",
      pinId: selectedPin.id,
      coordinates,
    });
  },

  nudgeSelectedPin: (direction: Position) => {
    const selectedPin = getSelectedGeometry(get()) as Point;

    const pointCoordinates = MercatorCoordinate.fromLngLat(
      { lng: selectedPin.coordinates.longitude, lat: selectedPin.coordinates.latitude },
      0
    );
    const base = 2 ** (-get().map.zoom - 1);
    pointCoordinates.x += base * direction.x;
    pointCoordinates.y += base * direction.y;
    const { lat, lng } = pointCoordinates.toLngLat();

    get().history.push({
      name: "movePin",
      pinId: selectedPin.id,
      coordinates: { latitude: lat, longitude: lng },
    });
  },
});
