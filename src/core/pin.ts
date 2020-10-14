import { MercatorCoordinate } from "mapbox-gl";

import { Coordinates, nextGeometryId, Point, Position } from "~/core/geometries";
import { App } from "~/core/helpers";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type Pin = {
  icon: string;
  width: number;
  color: string;
};

const initialState: Pin = {
  icon: "fire",
  width: 6,
  color: theme.colors.yellow[500],
};

export const pin = ({ mutate, get }: App) => ({
  ...initialState,

  setIcon: (icon: string) => {
    mutate(({ pin }) => {
      pin.icon = icon;
    });
  },

  setWidth: (width: number) => {
    mutate(({ pin }) => {
      pin.width = width;
    });
  },

  setColor: (color: string) => {
    mutate(({ pin }) => {
      pin.color = color;
    });
  },

  place: (latitude: number, longitude: number) => {
    const { history, pin } = get();

    history.push({
      name: "pin",
      point: {
        type: "Point",
        id: nextGeometryId(),
        source: MapSource.Pins,
        coordinates: { latitude, longitude },
        style: {
          color: pin.color,
          width: pin.width,
          icon: pin.icon,
        },
      },
    });
  },

  transientUpdateSelectedPin: (icon: string, color: string, width: number) => {
    mutate(({ geometries, selection }) => {
      const point = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

      point.transientStyle = {
        color: color,
        width: width,
      };
    });
  },

  updateSelectedPin: (icon: string, color: string, width: number) => {
    const { selection, history } = get();

    if (!selection.selectedGeometryId) {
      return;
    }

    mutate(({ geometries, selection }) => {
      const point = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

      delete point.transientStyle;
    });

    history.push({
      name: "updatePin",
      pinId: selection.selectedGeometryId,
      icon,
      color,
      width,
    });
  },

  editSelectedPinCoordinates: (coordinates: Coordinates) => {
    mutate(({ geometries, selection }) => {
      const selectedGeometry = geometries.items.find(
        (geometry) => geometry.id === selection.selectedGeometryId
      ) as Point;

      selectedGeometry.coordinates = coordinates;
    });
  },

  endEditSelectedPinCoordinates: (coordinates: Coordinates) => {
    const { geometries, selection, history } = get();
    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    if (selectedGeometry?.type !== "Point") {
      return;
    }

    history.push({
      name: "movePin",
      pinId: selectedGeometry.id,
      coordinates,
    });
  },

  nudgeSelectedPin: (direction: Position) => {
    const { geometries, selection, history, mapView } = get();
    const point = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    const pointCoordinates = MercatorCoordinate.fromLngLat(
      { lng: point.coordinates.longitude, lat: point.coordinates.latitude },
      0
    );
    const base = 2 ** (-mapView.zoom - 1);
    pointCoordinates.x += base * direction.x;
    pointCoordinates.y += base * direction.y;
    const { lat, lng } = pointCoordinates.toLngLat();

    history.push({
      name: "movePin",
      pinId: point.id,
      coordinates: { latitude: lat, longitude: lng },
    });
  },
});
