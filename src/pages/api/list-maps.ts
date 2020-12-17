import { IncomingMessage } from "http";
import HttpStatus from "http-status-codes";
import { orderBy } from "lodash";
import { NextApiHandler } from "next";

import { MapModel, paginate } from "~/core/db";
import { getUserId, withApiSession } from "~/core/session";

export const fetchMaps = async (req: IncomingMessage): Promise<MapModel[]> => {
  const userId = await getUserId(req);
  if (!userId) {
    return [];
  }

  const items = await paginate<MapModel>({
    TableName: "maps",
    FilterExpression: "userId = :userId and attribute_not_exists(deletedAt)",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  });

  return orderBy(items, (map) => map.updatedAt, "desc") as MapModel[];
};

const ListMaps: NextApiHandler = withApiSession(async (req, res) => {
  const maps = await fetchMaps(req);

  return res.status(HttpStatus.OK).json({
    maps,
  });
});

export default ListMaps;
