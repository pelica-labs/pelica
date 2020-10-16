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

export type ItineraryProfile = "walking" | "driving" | "cycling" | "direct";

type Itineraries = {
  isLoadingRoute: boolean;
};

const initialState: Itineraries = {
  isLoadingRoute: false,
};

export const itineraries = ({ mutate, get }: App) => ({
  ...initialState,

  open: () => {
    mutate((state) => {
      state.itineraries.isLoadingRoute = false;
    });
  },

  close: () => {
    mutate((state) => {
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
      state.selection.selectedGeometryId = nextGeometryId();
      state.geometries.items.push({
        type: "Line",
        id: state.selection.selectedGeometryId,
        source: MapSource.Routes,
        transientPoints: [],
        rawPoints: [],
        points: [],
        smartMatching: state.routes.smartMatching,
        style: state.routes.style,
        itinerary: {
          profile: "driving",
          steps: [],
        },
      });
    });
  },

  addStep: (place: Place) => {
    get().history.push({
      name: "addRouteStep",
      geometryId: get().selection.selectedGeometryId as number,
      place,
    });
  },

  addManualStep: (coordinates: Coordinates) => {
    get().history.push({
      name: "addRouteStep",
      geometryId: get().selection.selectedGeometryId as number,
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
      geometryId: get().selection.selectedGeometryId as number,

      index,
      place,
    });
  },

  moveStep: (from: number, to: number) => {
    get().history.push({
      name: "moveRouteStep",
      geometryId: get().selection.selectedGeometryId as number,

      from,
      to,
    });
  },

  deleteStep: (index: number) => {
    get().history.push({
      name: "deleteRouteStep",
      geometryId: get().selection.selectedGeometryId as number,
      index,
    });
  },

  updateProfile: (profile: ItineraryProfile) => {
    get().history.push({
      name: "updateRouteProfile",
      geometryId: get().selection.selectedGeometryId as number,
      profile,
    });
  },

  resolveCurrentItinerary: (points: Coordinates[]) => {
    mutate((state) => {
      if (!state.selection.selectedGeometryId) {
        return;
      }

      const geometry = state.geometries.items.find(
        (item) => item.id === state.selection.selectedGeometryId
      ) as ItineraryLine;

      geometry.points = points;

      state.itineraries.isLoadingRoute = false;
    });
  },
});
