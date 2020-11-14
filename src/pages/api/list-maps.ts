import { IncomingMessage } from "http";
import HttpStatus from "http-status-codes";
import { orderBy } from "lodash";
import { NextApiHandler } from "next";

import { MapModel } from "~/core/db";
import { getUserId, withApiSession } from "~/core/session";
import { dynamo } from "~/lib/aws";

export const fetchMaps = async (req: IncomingMessage): Promise<MapModel[]> => {
  const userId = await getUserId(req);
  if (!userId) {
    return [];
  }

  const response = await dynamo
    .scan({
      TableName: "maps",
      FilterExpression: "userId = :userId and attribute_not_exists(deletedAt)",
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
