import React from "react";

import { GeolocationButton } from "~/components/GeolocationButton";
import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/ResetOrientationButton";
import { Sidebar } from "~/components/Sidebar";
import { Tips } from "~/components/Tips";
import { useKeyboard } from "~/hooks/useKeyboard";
import { useScreenDimensions } from "~/hooks/useScreenDimensions";

type Props = {
  onImage: (image: string) => void;
};

export const MapEditor: React.FC<Props> = ({ onImage }) => {
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
        <PlaceAutocomplete />
        <GeolocationButton />
      </div>
    </div>
  );
};
