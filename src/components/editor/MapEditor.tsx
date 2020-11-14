import { debounce } from "lodash";
import React, { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

import { ItineraryInput } from "~/components/editor/controls/ItineraryInput";
import { HistoryButtons } from "~/components/editor/HistoryButtons";
import { Sidebar } from "~/components/editor/Sidebar";
import { Alerts } from "~/components/layout/Alerts";
import { GeolocationButton } from "~/components/map/GeolocationButton";
import { Map } from "~/components/map/Map";
import { PlaceAutocomplete } from "~/components/map/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/map/ResetOrientationButton";
import { CloudUploadIcon } from "~/components/ui/Icon";
import { app, useStore, useStoreSubscription } from "~/core/app";
import { MapModel } from "~/core/db";
import { getSelectedItinerary, getSyncableState } from "~/core/selectors";
import { useHotkey } from "~/hooks/useHotkey";
import { useKeyboard } from "~/hooks/useKeyboard";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";

type Props = {
  map: MapModel;
};

export const MapEditor: React.FC<Props> = ({ map }) => {
  const itineraryContainer = useRef<HTMLDivElement>(null);
  const place = useStore((store) => store.map.place);
  const editorMode = useStore((store) => store.editor.mode);
  const currentLocation = useStore((store) => store.geolocation.currentLocation);
  const selectedItinerary = useStore((store) => getSelectedItinerary(store));
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const dropzone = useDropzone({
    noClick: true,
    maxFiles: 1,
    onDrop: ([file]) => {
      app.imports.importFile(file);
    },
    onDropRejected: ([file]) => {
      app.alerts.trigger({
        message: `Could not process file\n${file.errors.map((error) => error.message).join("\n")}`,
        color: "red",
      });
    },
  });
  const showTopLeftControls = true;
  const showHistoryButtons = !screenDimensions.md;

  useKeyboard();
  useScreenDimensions();

  useHotkey({ key: "s", meta: true }, () => {
    app.alerts.trigger({
      message: "Pelica auto-saves your work 😉",
      color: "green",
      timeout: 3000,
    });
  });

  useEffect(() => {
    app.sync.mergeState(map);

    setTimeout(() => {
      app.entities.forceRerender();
    });
  }, [map]);

  useStoreSubscription(
    (store) => getSyncableState(store),
    debounce((map) => {
      app.sync.saveState(map);
    }, 1000)
  );

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
    <div className="flex flex-col md:flex-row h-full justify-between bg-gray-200" {...dropzone.getRootProps()}>
      <input {...dropzone.getInputProps()} />
      {dropzone.isDragActive && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="flex flex-col items-center text-white">
            <CloudUploadIcon className="w-24 h-24" />

            <span className="text-white text-xl text-medium mt-10">
              Import GPX or GeoJSON files by dropping them here
            </span>
          </div>
        </div>
      )}

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
      </div>

      <Sidebar />

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

              <GeolocationButton />

              <ResetOrientationButton />
            </>
          )}
        </div>
      )}
    </div>
  );
};
