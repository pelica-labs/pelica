import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";

import { nextGeometryId } from "~/core/geometries";
import { App } from "~/core/helpers";
import { MapSource } from "~/map/sources";

type Itinerary = GeocodeFeature[];

type Itineraries = {
  currentItinerary: Itinerary;
};

const initialState: Itineraries = {
  currentItinerary: [],
};

export const itineraries = ({ mutate }: App) => ({
  ...initialState,

  updateCurrentItinerary: async (itinerary: Itinerary) => {
    mutate(({ itineraries, line, editor }) => {
      itineraries.currentItinerary = itinerary;

      line.currentLine = {
        type: "Line",
        id: nextGeometryId(),
        source: MapSource.Routes,
        points: itinerary.map((place) => {
          return { latitude: place.center[1], longitude: place.center[0] };
        }),
        smartPoints: [],
        smartMatching: editor.smartMatching,
        style: {
          color: line.color,
          width: line.width,
          outlineColor: line.outlineColor,
        },
      };
    });

    // const { history, line } = get();

    // if (!line.currentLine) {
    //   return;
    // }

    // const smartPoints = line.currentLine.smartMatching.enabled
    //   ? await smartMatch(line.currentLine, line.currentLine.smartMatching.profile as SmartMatchingProfile)
    //   : [];

    // history.push({
    //   name: "draw",
    //   line: {
    //     ...line.currentLine,
    //     smartPoints,
    //   },
    // });
  },
});
