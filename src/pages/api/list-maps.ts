import { IncomingMessage } from "http";
import HttpStatus from "http-status-codes";
import { orderBy } from "lodash";
import { NextApiHandler } from "next";

import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { getUserId, withApiSession } from "~/lib/session";

export const fetchMaps = async (req: IncomingMessage): Promise<MapModel[]> => {
  const userId = await getUserId(req);
  if (!userId) {
    return [];
  }

  const response = await dynamo
    .scan({
      TableName: "maps",
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    })
    .promise();

  return orderBy(response.Items, (map) => map.updatedAt, "desc") as MapModel[];
};

const ListMaps: NextApiHandler = withApiSession(async (req, res) => {
  const maps = await fetchMaps(req);

  return res.status(HttpStatus.OK).json({
    maps,
  });
});

export default ListMaps;
