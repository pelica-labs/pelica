import { NextPage } from "next";
import React, { useState } from "react";

import { MapEditor } from "~/components/MapEditor";
import { MapExport } from "~/components/MapExport";

const App: NextPage = () => {
  const [image, setImage] = useState<string | null>(null);

  return (
    <>
      {image && (
        <MapExport
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

export default App;
