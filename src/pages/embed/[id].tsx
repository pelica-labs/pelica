import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { Whoops } from "~/components/layout/Whoops";
import { Map } from "~/components/map/Map";
import { MapModel } from "~/core/db";
import { dynamo } from "~/lib/aws";

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

  if (!map.Item || map.Item.deletedAt) {
    return { props: { map: null } };
  }

  return {
    props: {
      map: map.Item as MapModel,
    },
  };
};

const EmbedMap: NextPage<Props> = ({ map }) => {
  if (!map) {
    return <Whoops statusCode={404} />;
  }

  return <Map readOnly map={map} />;
};

export default EmbedMap;
