import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { NextPage } from "next";
import React, { useState } from "react";

import { Map } from "../components/Map";
import { PlaceAutocomplete } from "../components/PlaceAutocomplete";

const Home: NextPage = () => {
  const [place, setPlace] = useState<GeocodeFeature>(null);

  return (
    <>
      <Map selectedPlace={place} />
      <div className="fixed top-0 left-0 mt-2 ml-2">
        <PlaceAutocomplete value={place} onChange={setPlace} />
      </div>
    </>
  );
};

export default Home;
