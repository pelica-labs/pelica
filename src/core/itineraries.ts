import { Position } from "@turf/turf";

import { App } from "~/core/helpers";
import { ItineraryRoute, Route } from "~/core/routes";
import { getSelectedEntity } from "~/core/selectors";
import { numericId } from "~/lib/id";
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

export const itinerariesInitialState: Itineraries = {
  isLoadingRoute: false,
};

export const itineraries = ({ mutate, get }: App) => ({
  ...itinerariesInitialState,

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
      const id = numericId();

      state.selection.ids = [id];
      state.entities.items.push({
        type: "Route",
        id,
        source: MapSource.Routes,
        closed: false,
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
    const selectedRoute = getSelectedEntity(get()) as Route;

    get().history.push({
      name: "addRouteStep",
      entityId: selectedRoute.id,
      place,
    });
  },

  addManualStep: (coordinates: Position) => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    get().history.push({
      name: "addRouteStep",
      entityId: selectedRoute.id,
      place: {
        id: `${coordinates[1]};${coordinates[0]}`,
        type: "Coordinates",
        center: coordinates,
        name: `${coordinates[1].toFixed(7)}, ${coordinates[0].toFixed(7)}`,
      },
    });
  },

  updateStep: (index: number, place: Place | null) => {
    if (!place) {
      // @todo?
      return;
    }

    const selectedRoute = getSelectedEntity(get()) as Route;

    get().history.push({
      name: "updateRouteStep",
      entityId: selectedRoute.id,
      index,
      place,
    });
  },

  moveStep: (from: number, to: number) => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    get().history.push({
      name: "moveRouteStep",
      entityId: selectedRoute.id,
      from,
      to,
    });
  },

  deleteStep: (index: number) => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    get().history.push({
      name: "deleteRouteStep",
      entityId: selectedRoute.id,
      index,
    });
  },

  updateProfile: (profile: ItineraryProfile) => {
    const selectedRoute = getSelectedEntity(get()) as Route;

    get().history.push({
      name: "updateRouteProfile",
      entityId: selectedRoute.id,
      profile,
    });
  },

  resolveCurrentItinerary: (points: Position[]) => {
    // @todo: this might be bugged since called aysnchrounously, if the selection changes between calls.
    mutate((state) => {
      const route = getSelectedEntity(state) as ItineraryRoute;
      if (!route) {
        return;
      }

      route.points = points;

      state.itineraries.isLoadingRoute = false;
    });
  },
});
