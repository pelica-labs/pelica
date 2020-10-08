import { App } from "~/core/helpers";
import { Coordinates, nextGeometryId, Point, Position } from "~/lib/geometry";
import { MapSource } from "~/lib/sources";

export const pin = ({ mutate, get }: App) => ({
  pin: (latitude: number, longitude: number) => {
    const { editor } = get();

    mutate(({ history }) => {
      history.actions.push({
        name: "pin",
        point: {
          type: "Point",
          id: nextGeometryId(),
          source: MapSource.Pins,
          coordinates: { latitude, longitude },
          style: {
            strokeColor: editor.strokeColor,
            strokeWidth: editor.strokeWidth,
          },
        },
      });
    });
  },

  updateSelectedPin: (strokeColor: string, strokeWidth: number) => {
    mutate(({ geometries, selection, history }) => {
      const selectedGeometry = geometries.items.find(
        (geometry) => geometry.id === selection.selectedGeometryId
      ) as Point;

      history.actions.push({
        name: "updatePin",
        pinId: selectedGeometry.id,
        strokeColor,
        strokeWidth,
      });
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
    mutate(({ geometries, selection, history }) => {
      const selectedGeometry = geometries.items.find(
        (geometry) => geometry.id === selection.selectedGeometryId
      ) as Point;

      if (selectedGeometry?.type !== "Point") {
        return;
      }

      history.actions.push({
        name: "movePin",
        pinId: selectedGeometry.id,
        coordinates,
      });
    });
  },

  moveSelectedPin: (direction: Position) => {
    mutate(({ geometries, selection, history, mapView }) => {
      const selectedGeometry = geometries.items.find(
        (geometry) => geometry.id === selection.selectedGeometryId
      ) as Point;

      history.actions.push({
        name: "nudgePin",
        pinId: selectedGeometry.id,
        direction,
        zoom: mapView.zoom,
      });
    });
  },
});
