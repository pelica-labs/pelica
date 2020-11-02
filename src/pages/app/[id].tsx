import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { MapEditor } from "~/components/MapEditor";
import { dynamo } from "~/lib/aws";
import { MapModel } from "~/lib/db";
import { EmptyProps, redirect } from "~/lib/redirect";
import { getUserId, withSession } from "~/lib/session";

type Props = {
  map: MapModel;
};

export const getServerSideProps: GetServerSideProps<Props | EmptyProps> = withSession(async (ctx) => {
  const id = ctx.query.id as string;

  const map = await dynamo
    .get({
      TableName: "maps",
      Key: { id },
    })
    .promise();

  if (!map.Item || map.Item.deletedAt) {
    return redirect(ctx.res, "/404");
  }

  const userId = await getUserId(ctx.req);
  if (map.Item.userId !== userId) {
    return redirect(ctx.res, `/map/${id}`);
  }

  return {
    props: {
      map: map.Item as MapModel,
    },
  };
});

const App: NextPage<Props> = ({ map }) => {
  return <MapEditor map={map} />;
};

export default App;
