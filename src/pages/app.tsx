import { GetStaticProps, NextPage } from "next";
import React from "react";

import { MapEditor } from "~/components/MapEditor";
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
  return <MapEditor initialStyles={initialStyles} />;
};

export default App;
