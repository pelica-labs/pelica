import React, { useRef } from "react";

import { GeolocationButton } from "~/components/GeolocationButton";
import { ItineraryInput } from "~/components/ItineraryInput";
import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/ResetOrientationButton";
import { Sidebar } from "~/components/Sidebar";
import { Tips } from "~/components/Tips";
import { useApp, useStore, useStoreSubscription } from "~/core/app";
import { ItineraryLine } from "~/core/geometries";
import { useKeyboard } from "~/hooks/useKeyboard";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";
import { Style } from "~/lib/style";

type Props = {
  initialStyles: Style[];
};

export const MapEditor: React.FC<Props> = ({ initialStyles }) => {
  const app = useApp();
  const place = useStore((store) => store.map.place);
  const editorMode = useStore((store) => store.editor.mode);
  const currentLocation = useStore((store) => store.geolocation.currentLocation);
  const currentItinerary = useStore(
    (store) => store.geometries.items.find((item) => item.id === store.itineraries.geometryId) as ItineraryLine
  );
  const itineraryContainer = useRef<HTMLDivElement>(null);

  useKeyboard();
  useScreenDimensions();

  /**
   * Focus itinerary input when switching to mode
   */
  useStoreSubscription(
    (store) => store.editor.mode === "itinerary",
    (itineraryMode) => {
      if (itineraryMode) {
        setTimeout(() => {
          itineraryContainer.current?.querySelector("input")?.focus();
        });
      }
    }
  );

  return (
    <div className="flex h-full justify-between">
      <div className="relative w-full h-full">
        <Map />

        {editorMode !== "export" && (
          <>
            <div className="absolute top-0 right-0 mt-1 mr-1">
              <ResetOrientationButton />
            </div>

            <div className="absolute bottom-0 mb-2 flex justify-center w-full z-10 pointer-events-none">
              <Tips />
            </div>
          </>
        )}
      </div>

      <Sidebar initialStyles={initialStyles} />

      {editorMode !== "export" && (
        <div className="absolute top-0 left-0 flex flex-col space-y-2 mt-2 ml-2">
          {currentItinerary?.steps && (
            <div ref={itineraryContainer}>
              <ItineraryInput
                bias={currentLocation ?? undefined}
                value={currentItinerary.steps}
                onLoadingRoute={() => {
                  app.itineraries.toggleLoading();
                }}
                onRouteFound={(points) => {
                  app.itineraries.resolveCurrentItinerary(points);
                }}
                onStepAdded={(place) => {
                  app.itineraries.addStep(place);
                }}
                onStepDeleted={(index) => {
                  app.itineraries.deleteStep(index);
                }}
                onStepMoved={(from, to) => {
                  app.itineraries.moveStep(from, to);
                }}
                onStepUpdated={(index, place) => {
                  app.itineraries.updateStep(index, place);
                }}
              />
            </div>
          )}

          {!currentItinerary && (
            <>
              <PlaceAutocomplete
                collapsesWhenEmpty
                bias={currentLocation ?? undefined}
                value={place}
                onChange={(place) => {
                  app.map.setPlace(place);
                }}
              />

              <GeolocationButton
                onChange={(coordinates) => {
                  app.map.move(coordinates, 16, 0, 0);
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
