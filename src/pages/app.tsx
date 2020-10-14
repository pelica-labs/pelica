import { GetStaticProps, NextPage } from "next";
import React, { useState } from "react";

import { MapEditor } from "~/components/MapEditor";
import { MapExport } from "~/components/MapExport";
import { Style } from "~/lib/style";
import { fetchStyles } from "~/pages/api/styles";

type Props = {
  initialStyles: Style[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      initialStyles: await fetchStyles(),
    },
    revalidate: 3600,
  };
};

const App: NextPage<Props> = ({ initialStyles }) => {
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
          initialStyles={initialStyles}
          onImage={(image) => {
            setImage(image);
          }}
        />
      )}
    </>
  );
};

export default App;
