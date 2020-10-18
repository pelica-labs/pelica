import { Coordinates, ItineraryLine, Line, nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { getSelectedGeometry } from "~/core/selectors";
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
      const id = nextGeometryId();

      state.selection.ids = [id];
      state.geometries.items.push({
        type: "Line",
        id,
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
    const selectedRoute = getSelectedGeometry(get()) as Line;

    get().history.push({
      name: "addRouteStep",
      geometryId: selectedRoute.id,
      place,
    });
  },

  addManualStep: (coordinates: Coordinates) => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

    get().history.push({
      name: "addRouteStep",
      geometryId: selectedRoute.id,
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
      // @todo?
      return;
    }

    const selectedRoute = getSelectedGeometry(get()) as Line;

    get().history.push({
      name: "updateRouteStep",
      geometryId: selectedRoute.id,
      index,
      place,
    });
  },

  moveStep: (from: number, to: number) => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

    get().history.push({
      name: "moveRouteStep",
      geometryId: selectedRoute.id,
      from,
      to,
    });
  },

  deleteStep: (index: number) => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

    get().history.push({
      name: "deleteRouteStep",
      geometryId: selectedRoute.id,
      index,
    });
  },

  updateProfile: (profile: ItineraryProfile) => {
    const selectedRoute = getSelectedGeometry(get()) as Line;

    get().history.push({
      name: "updateRouteProfile",
      geometryId: selectedRoute.id,
      profile,
    });
  },

  resolveCurrentItinerary: (points: Coordinates[]) => {
    // @todo: this might be bugged since called aysnchrounously, if the selection changes between calls.
    mutate((state) => {
      const route = getSelectedGeometry(state) as ItineraryLine;
      if (!route) {
        return;
      }

      route.points = points;

      state.itineraries.isLoadingRoute = false;
    });
  },
});
