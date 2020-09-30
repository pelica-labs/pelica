import React from "react";

import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { Toolbar } from "~/components/Toolbar";

export const MapEditor: React.FC = () => {
  return (
    <>
      <Map />

      <div className="fixed top-0 left-0 mt-2 ml-2">
        <PlaceAutocomplete />
      </div>

      <div className="fixed top-0 right-0 mt-2 mr-2">
        <Toolbar />
      </div>
    </>
  );
};
