import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { FourOhFour } from "~/components/404";
import { MapViewer } from "~/components/MapViewer";
import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";

type Props = {
  map: MapModel | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = ctx.query.id as string;

  const map = await dynamo
    .get({
      TableName: "maps",
      Key: { id },
    })
    .promise();

  if (!map.Item) {
    return { props: { map: null } };
  }

  return {
    props: {
      map: map.Item as MapModel,
    },
  };
};

const ViewMap: NextPage<Props> = ({ map }) => {
  if (!map) {
    return <FourOhFour />;
  }

  return <MapViewer map={map} />;
};

export default ViewMap;
