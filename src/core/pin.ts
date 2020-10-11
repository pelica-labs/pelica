import { MercatorCoordinate } from "mapbox-gl";

import { Coordinates, nextGeometryId, Point, Position } from "~/core/geometries";
import { App } from "~/core/helpers";
import { MapSource } from "~/lib/sources";

export const pin = ({ mutate, get }: App) => ({
  place: (latitude: number, longitude: number) => {
    const { history, editor } = get();

    history.push({
      name: "pin",
      point: {
        type: "Point",
        id: nextGeometryId(),
        source: MapSource.Pins,
        coordinates: { latitude, longitude },
        style: {
          strokeColor: editor.strokeColor,
          strokeWidth: editor.strokeWidth,
          icon: editor.icon,
        },
      },
    });
  },

  updateSelectedPin: (icon: string, strokeColor: string, strokeWidth: number) => {
    const { geometries, selection, history } = get();

    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    history.push({
      name: "updatePin",
      pinId: selectedGeometry.id,
      icon,
      strokeColor,
      strokeWidth,
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
