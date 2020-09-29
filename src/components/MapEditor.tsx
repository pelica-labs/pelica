import React from "react";

import { Map } from "./Map";
import { MapContextProvider } from "./MapContext";
import { PlaceAutocomplete } from "./PlaceAutocomplete";
import { Toolbar } from "./Toolbar";

export const MapEditor: React.FC = () => {
  return (
    <MapContextProvider>
      <Map />

      <div className="fixed top-0 left-0 mt-2 ml-2">
        <PlaceAutocomplete />
      </div>

      <div className="fixed top-0 right-0 mt-2 mr-2">
        <Toolbar />
      </div>
    </MapContextProvider>
  );
};
