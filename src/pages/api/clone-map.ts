import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { dynamo } from "~/lib/dynamo";
import { readableUniqueId } from "~/lib/id";
import { withApiSession } from "~/lib/session";

const CloneMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const id = req.body.id;
  const userId = req.session.get("userId");

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
    return res.status(HttpStatus.NOT_FOUND).json({
      error: "Map not found",
      id,
    });
  }

  const newId = readableUniqueId();

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
