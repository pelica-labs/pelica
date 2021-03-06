import { debounce } from "lodash";
import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";

import { ItineraryInput } from "~/components/editor/controls/ItineraryInput";
import { HistoryButtons } from "~/components/editor/HistoryButtons";
import { Sidebar } from "~/components/editor/Sidebar";
import { VideoExport } from "~/components/editor/VideoExport";
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
import { useLayout } from "~/hooks/useLayout";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";

type Props = {
  map: MapModel;
};

export const MapEditor: React.FC<Props> = ({ map }) => {
  const itineraryContainer = useRef<HTMLDivElement>(null);
  const place = useStore((store) => store.map.place);
  const editorMode = useStore((store) => store.editor.mode);
  const currentCoordinates = useStore((store) => store.map.coordinates);
  const currentZoom = useStore((store) => store.map.zoom);
  const videoExport = useStore((store) => store.exports.videoExport);
  const selectedItinerary = useStore((store) => getSelectedItinerary(store));
  const layout = useLayout();
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
  const showHistoryButtons = layout.vertical;

  useKeyboard();
  useScreenDimensions();

  useHotkey({ key: "s", meta: true }, () => {
    app.alerts.trigger({
      message: "Pelica auto-saves your work 😉",
      color: "green",
      timeout: 3000,
    });
  });

  useHotkey({ key: " " }, () => {
    app.map.fitSelectedEntities();
  });

  useStoreSubscription(
    (store) => JSON.stringify(getSyncableState(store)),
    debounce(() => {
      app.sync.saveState(getSyncableState());
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
        <Map map={map} />

        <div className="absolute bottom-0 mb-2 flex justify-center w-full z-10 pointer-events-none">
          <Alerts />

          {videoExport && (
            <div className="pointer-events-auto">
              <VideoExport map={map} />
            </div>
          )}
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
                bias={currentZoom > 10 && currentCoordinates ? currentCoordinates : undefined}
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
                bias={currentZoom > 10 && currentCoordinates ? currentCoordinates : undefined}
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
