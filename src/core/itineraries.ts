import { Coordinates, nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { MapSource } from "~/map/sources";

export type Place = {
  id: string;
  type: "Feature" | "Coordinates";
  center: number[];
  name: string;
  bbox?: number[];
};

type Itinerary = Place[];

type Itineraries = {
  currentItinerary: Itinerary;
};

const initialState: Itineraries = {
  currentItinerary: [],
};

export const itineraries = ({ mutate }: App) => ({
  ...initialState,

  updateCurrentItinerary: async (itinerary: Itinerary) => {
    mutate(({ itineraries }) => {
      itineraries.currentItinerary = itinerary;
    });
  },

  addStep: (coordinates: Coordinates) => {
    mutate(({ itineraries }) => {
      itineraries.currentItinerary.push({
        id: `${coordinates.latitude};${coordinates.longitude}`,
        type: "Coordinates",
        center: [coordinates.longitude, coordinates.latitude],
        name: `${coordinates.latitude.toFixed(7)}, ${coordinates.longitude.toFixed(7)}`,
      });
    });
  },

  displayCurrentItinerary: (points: Coordinates[]) => {
    mutate(({ routes }) => {
      routes.currentRoute = {
        type: "Line",
        id: nextGeometryId(),
        source: MapSource.Routes,
        points,
        smartPoints: [],
        smartMatching: routes.smartMatching,
        style: {
          color: routes.color,
          width: routes.width,
          outlineColor: routes.outlineColor,
        },
      };
    });
  },
});
