import React from "react";

import { GeolocationButton } from "~/components/GeolocationButton";
import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/ResetOrientationButton";
import { Sidebar } from "~/components/Sidebar";
import { useKeyboard } from "~/lib/keyboard";
import { useScreen } from "~/lib/screen";

export const MapEditor: React.FC = () => {
  useKeyboard();
  useScreen();

  return (
    <div className="flex h-full justify-between">
      <div className="relative w-full h-full">
        <Map />

        <div className="absolute top-0 right-0 mt-1 mr-1">
          <ResetOrientationButton />
        </div>
      </div>

      <Sidebar />

      <div className="absolute top-0 left-0 flex flex-col space-y-2 mt-2 ml-2">
        <PlaceAutocomplete />
        <GeolocationButton />
      </div>
    </div>
  );
};
