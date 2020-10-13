import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import React, { useState } from "react";

import { GeolocationButton } from "~/components/GeolocationButton";
import { ItineraryInput } from "~/components/ItineraryInput";
import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/ResetOrientationButton";
import { Sidebar } from "~/components/Sidebar";
import { Tips } from "~/components/Tips";
import { useApp, useStore } from "~/core/app";
import { useKeyboard } from "~/hooks/useKeyboard";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";

type Props = {
  onImage: (image: string) => void;
};

export const MapEditor: React.FC<Props> = ({ onImage }) => {
  const app = useApp();
  const place = useStore((store) => store.mapView.place);

  useKeyboard();
  useScreenDimensions();

  return (
    <div className="flex h-full justify-between">
      <div className="relative w-full h-full">
        <Map />

        <div className="absolute top-0 right-0 mt-1 mr-1">
          <ResetOrientationButton />
        </div>

        <div className="absolute bottom-0 mb-2 flex justify-center w-full z-10 pointer-events-none">
          <Tips />
        </div>
      </div>

      <Sidebar onImage={onImage} />

      <div className="absolute top-0 left-0 flex flex-col space-y-2 mt-2 ml-2">
        <PlaceAutocomplete
          collapsesWhenEmpty
          value={place}
          onChange={(place) => {
            app.mapView.setPlace(place);
          }}
        />

        <GeolocationButton
          onChange={(coordinates) => {
            app.mapView.move(coordinates, 16, 0, 0);
          }}
        />
      </div>
    </div>
  );
};
