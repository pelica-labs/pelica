import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { dynamo } from "~/lib/aws";
import { uniqueId } from "~/lib/id";
import { getUserId, withApiSession } from "~/lib/session";

const CloneMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const id = req.body.id;
  const userId = await getUserId(req);

  const map = await dynamo
    .get({
      TableName: "maps",
      Key: { id },
    })
    .promise();

  if (!map.Item || map.Item.userId !== userId) {
    return res.status(HttpStatus.NOT_FOUND).json({
      error: "Map not found",
      id,
    });
  }

  const newId = uniqueId();

  await dynamo
    .put({
      TableName: "maps",
      Item: {
        ...map.Item,
        id: newId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    })
    .promise();

  return res.status(HttpStatus.OK).json({
    id: newId,
  });
});

export default CloneMap;
