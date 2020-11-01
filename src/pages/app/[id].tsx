import { NextPage } from "next";
import React from "react";

import { MapEditor } from "~/components/MapEditor";
import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { redirect } from "~/lib/redirect";
import { withSession } from "~/lib/session";

type Props = {
  map: MapModel;
};

export const getServerSideProps = withSession(async (ctx) => {
  const id = ctx.query.id as string;
  const userId = ctx.req.session.get("userId");
  if (!userId) {
    return redirect(ctx.res, "/404");
  }

  const map = await dynamo
    .get({
      TableName: "maps",
      Key: {
        id,
        userId,
      },
    })
    .promise();

  if (!map.Item) {
    return redirect(ctx.res, "/404");
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
