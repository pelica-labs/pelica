import { GetStaticProps, NextPage } from "next";
import React, { useState } from "react";

import { MapEditor } from "~/components/MapEditor";
import { MapExport } from "~/components/MapExport";
import { Style } from "~/lib/style";
import { getBaseUrl } from "~/lib/url";

type Props = {
  initialStyles: Style[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      initialStyles: await fetch(`${getBaseUrl()}/api/styles`)
        .then((res) => res.json())
        .then((res) => res.styles),
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
