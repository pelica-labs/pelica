import { Coordinates, ItineraryLine, nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { MapSource } from "~/map/sources";

export type Place = {
  id: string;
  type: "Feature" | "Coordinates";
  center: number[];
  name: string;
  bbox?: number[];
};

type Itineraries = {
  geometryId: number | null;
  isLoadingRoute: boolean;
};

const initialState: Itineraries = {
  geometryId: null,
  isLoadingRoute: false,
};

export const itineraries = ({ mutate, get }: App) => ({
  ...initialState,

  open: (geometryId: number) => {
    mutate((state) => {
      state.itineraries.geometryId = geometryId;
      state.itineraries.isLoadingRoute = false;
    });
  },

  close: () => {
    mutate((state) => {
      state.itineraries.geometryId = null;
      state.itineraries.isLoadingRoute = false;
    });
  },

  toggleLoading: () => {
    mutate((state) => {
      state.itineraries.isLoadingRoute = true;
    });
  },

  startNewItininerary: () => {
    mutate((state) => {
      state.itineraries.geometryId = nextGeometryId();
      state.geometries.items.push({
        type: "Line",
        id: state.itineraries.geometryId,
        source: MapSource.Routes,
        points: [],
        smartPoints: [],
        smartMatching: state.routes.smartMatching,
        style: state.routes.style,
        steps: [],
      });
    });
  },

  addStep: (place: Place) => {
    get().history.push({
      name: "addRouteStep",
      geometryId: get().itineraries.geometryId as number,
      place,
    });
  },

  addManualStep: (coordinates: Coordinates) => {
    get().history.push({
      name: "addRouteStep",
      geometryId: get().itineraries.geometryId as number,
      place: {
        id: `${coordinates.latitude};${coordinates.longitude}`,
        type: "Coordinates",
        center: [coordinates.longitude, coordinates.latitude],
        name: `${coordinates.latitude.toFixed(7)}, ${coordinates.longitude.toFixed(7)}`,
      },
    });
  },

  updateStep: (index: number, place: Place | null) => {
    if (!place) {
      // @todo
      return;
    }

    get().history.push({
      name: "updateRouteStep",
      geometryId: get().itineraries.geometryId as number,

      index,
      place,
    });
  },

  moveStep: (from: number, to: number) => {
    get().history.push({
      name: "moveRouteStep",
      geometryId: get().itineraries.geometryId as number,

      from,
      to,
    });
  },

  deleteStep: (index: number) => {
    get().history.push({
      name: "deleteRouteStep",
      geometryId: get().itineraries.geometryId as number,
      index,
    });
  },

  resolveCurrentItinerary: (points: Coordinates[]) => {
    mutate((state) => {
      if (!state.itineraries.geometryId) {
        return;
      }

      const geometry = state.geometries.items.find((item) => item.id === state.itineraries.geometryId) as ItineraryLine;

      geometry.points = points;

      state.itineraries.isLoadingRoute = false;
    });
  },
});
