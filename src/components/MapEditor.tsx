import React, { useRef } from "react";

import { Alerts } from "~/components/Alerts";
import { GeolocationButton } from "~/components/GeolocationButton";
import { HistoryButtons } from "~/components/HistoryButtons";
import { ItineraryInput } from "~/components/ItineraryInput";
import { Map } from "~/components/Map";
import { MiniToolbar } from "~/components/MiniToolbar";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/ResetOrientationButton";
import { Sidebar } from "~/components/sidebar/Sidebar";
import { app, useStore, useStoreSubscription } from "~/core/app";
import { getSelectedItinerary } from "~/core/selectors";
import { useKeyboard } from "~/hooks/useKeyboard";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";
import { Style } from "~/lib/style";

type Props = {
  initialStyles: Style[];
};

export const MapEditor: React.FC<Props> = ({ initialStyles }) => {
  const itineraryContainer = useRef<HTMLDivElement>(null);
  const place = useStore((store) => store.map.place);
  const editorMode = useStore((store) => store.editor.mode);
  const currentLocation = useStore((store) => store.geolocation.currentLocation);
  const selectedItinerary = useStore((store) => getSelectedItinerary(store));
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);

  const showTopLeftControls = editorMode !== "export";
  const showHistoryButtons = !screenDimensions.md && editorMode !== "export";
  const showMinitoolbar = !screenDimensions.md && editorMode !== "move";

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
    <div className="flex flex-col md:flex-row h-full justify-between bg-gray-200">
      <div className="relative w-full h-full flex-1">
        <Map />

        <div className="absolute bottom-0 mb-2 flex justify-center w-full z-10 pointer-events-none">
          <Alerts />
        </div>

        {showHistoryButtons && (
          <div className="absolute bottom-0 left-0">
            <HistoryButtons />
          </div>
        )}

        {showMinitoolbar && (
          <div className="absolute bottom-0 left-0">
            <MiniToolbar />
          </div>
        )}
      </div>

      <Sidebar initialStyles={initialStyles} />

      {showTopLeftControls && (
        <div className="absolute top-0 left-0 flex flex-col space-y-2 mt-2 ml-2">
          {selectedItinerary && (
            <div ref={itineraryContainer}>
              <ItineraryInput
                bias={currentLocation ?? undefined}
                canClose={editorMode === "select"}
                profile={selectedItinerary.profile}
                value={selectedItinerary.steps}
                onClose={() => {
                  app.selection.clear();
                }}
                onLoadingRoute={() => {
                  app.itineraries.toggleLoading();
                }}
                onProfileUpdated={(profile) => {
                  app.itineraries.updateProfile(profile);
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

          {!selectedItinerary && (
            <>
              <PlaceAutocomplete
                collapsesWhenEmpty
                bias={currentLocation ?? undefined}
                value={place}
                onChange={(place) => {
                  app.map.setPlace(place);

                  if (place) {
                    app.pins.place(place?.center);
                  }
                }}
              />

              <GeolocationButton
                onChange={(coordinates) => {
                  app.map.move(coordinates, 16, 0, 0);
                }}
              />

              <ResetOrientationButton />
            </>
          )}
        </div>
      )}
    </div>
  );
};
