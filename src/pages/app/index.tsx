import { NextPage } from "next";
import React from "react";

import { LoadingScreen } from "~/components/LoadingScreen";
import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { readableUniqueId } from "~/lib/id";
import { redirect } from "~/lib/redirect";
import { getUserId, withSession } from "~/lib/session";

export const getServerSideProps = withSession(async (ctx) => {
  const id = readableUniqueId();
  const userId = await getUserId(ctx.req);

  const map: MapModel = {
    id,
    userId,
  };

  await dynamo
    .put({
      TableName: "maps",
      Item: map,
    })
    .promise();

  return redirect(ctx.res, `/app/${id}`);
});

const App: NextPage = () => {
  return <LoadingScreen title="Creating map" />;
};

export default App;
