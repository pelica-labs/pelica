import { MercatorCoordinate } from "mapbox-gl";

import { Coordinates, nextGeometryId, Point, Position } from "~/core/geometries";
import { App } from "~/core/helpers";
import { getSelectedGeometry } from "~/core/selectors";
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
      const selectedPin = getSelectedGeometry(state) as Point;
      if (!selectedPin.transientStyle) {
        selectedPin.transientStyle = selectedPin.style;
      }

      Object.assign(selectedPin.transientStyle, style);
    });
  },

  updateSelectedPin: (style: Partial<PinStyle>) => {
    const selectedPin = getSelectedGeometry(get()) as Point;
    if (!selectedPin) {
      return;
    }

    mutate((state) => {
      const selectedPin = getSelectedGeometry(state) as Point;

      delete selectedPin.transientStyle;
    });

    get().history.push({
      name: "updatePin",
      pinId: selectedPin.id,
      style: {
        ...selectedPin.style,
        ...style,
      },
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
