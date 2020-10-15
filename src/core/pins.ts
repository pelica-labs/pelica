import { MercatorCoordinate } from "mapbox-gl";

import { Coordinates, nextGeometryId, Point, Position } from "~/core/geometries";
import { App } from "~/core/helpers";
import { MapSource } from "~/map/sources";
import { theme } from "~/styles/tailwind";

export type Pins = {
  icon: string;
  width: number;
  color: string;
};

const initialState: Pins = {
  icon: "fire",
  width: 6,
  color: theme.colors.yellow[500],
};

export const pins = ({ mutate, get }: App) => ({
  ...initialState,

  setIcon: (icon: string) => {
    mutate(({ pins }) => {
      pins.icon = icon;
    });
  },

  setWidth: (width: number) => {
    mutate(({ pins }) => {
      pins.width = width;
    });
  },

  setColor: (color: string) => {
    mutate(({ pins }) => {
      pins.color = color;
    });
  },

  place: (latitude: number, longitude: number) => {
    const { history, pins } = get();

    history.push({
      name: "pin",
      point: {
        type: "Point",
        id: nextGeometryId(),
        source: MapSource.Pins,
        coordinates: { latitude, longitude },
        style: {
          color: pins.color,
          width: pins.width,
          icon: pins.icon,
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
    const { geometries, selection, history, map } = get();
    const point = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    const pointCoordinates = MercatorCoordinate.fromLngLat(
      { lng: point.coordinates.longitude, lat: point.coordinates.latitude },
      0
    );
    const base = 2 ** (-map.zoom - 1);
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
