import { NextPage } from "next";
import React, { useState } from "react";

import { MapEditor } from "~/components/MapEditor";
import { MapImage } from "~/components/MapImage";

const Home: NextPage = () => {
  const [image, setImage] = useState<string | null>(null);

  return (
    <>
      {image && (
        <MapImage
          image={image}
          onBack={() => {
            setImage(null);
          }}
        />
      )}

      {!image && (
        <MapEditor
          onImage={(image) => {
            setImage(image);
          }}
        />
      )}
    </>
  );
};

export default Home;
