import React from "react";

import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { Sidebar } from "~/components/Sidebar";
import { useKeyboard } from "~/lib/keyboard";

export const MapEditor: React.FC = () => {
  useKeyboard();

  return (
    <div className="flex h-full">
      <Map />
      <Sidebar />

      <div className="fixed top-0 left-0 mt-2 ml-2">
        <PlaceAutocomplete />
      </div>
    </div>
  );
};
