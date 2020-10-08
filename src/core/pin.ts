import { App } from "~/core/helpers";
import { Coordinates, nextGeometryId, Point, Position } from "~/lib/geometry";
import { MapSource } from "~/lib/sources";

export const pin = ({ mutate, get }: App) => ({
  place: (latitude: number, longitude: number) => {
    const { history, editor } = get();

    history.addAction({
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
  },

  updateSelectedPin: (strokeColor: string, strokeWidth: number) => {
    const { geometries, selection, history } = get();

    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    history.addAction({
      name: "updatePin",
      pinId: selectedGeometry.id,
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

    history.addAction({
      name: "movePin",
      pinId: selectedGeometry.id,
      coordinates,
    });
  },

  moveSelectedPin: (direction: Position) => {
    const { geometries, selection, history, mapView } = get();
    const selectedGeometry = geometries.items.find((geometry) => geometry.id === selection.selectedGeometryId) as Point;

    history.addAction({
      name: "nudgePin",
      pinId: selectedGeometry.id,
      direction,
      zoom: mapView.zoom,
    });
  },
});
