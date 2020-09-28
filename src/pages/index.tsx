import { GeocodeFeature } from "@mapbox/mapbox-sdk/services/geocoding";
import { Style } from "@mapbox/mapbox-sdk/services/styles";
import { NextPage } from "next";
import React, { useState } from "react";

import { Map } from "../components/Map";
import { PlaceAutocomplete } from "../components/PlaceAutocomplete";
import { StyleSelector } from "../components/StyleSelector";

const Home: NextPage = () => {
  const [place, setPlace] = useState<GeocodeFeature | null>(null);
  const [style, setStyle] = useState<Style | null>(null);

  return (
    <>
      <Map selectedPlace={place} selectedStyle={style} />
      <div className="fixed top-0 left-0 mt-2 ml-2">
        <PlaceAutocomplete value={place} onChange={setPlace} />
      </div>
      <div className="fixed bottom-0 left-0 mb-2 ml-2">
        <StyleSelector value={style} onChange={setStyle} />
      </div>
    </>
  );
};

export default Home;
