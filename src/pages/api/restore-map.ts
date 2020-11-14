import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { getUserId, withApiSession } from "~/core/session";
import { dynamo } from "~/lib/aws";

const RestoreMap: NextApiHandler = withApiSession(async (req, res) => {
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

  await dynamo
    .update({
      TableName: "maps",
      Key: { id },
      UpdateExpression: "remove deletedAt",
    })
    .promise();

  return res.status(HttpStatus.OK).json({
    message: "Map restored",
  });
});

export default RestoreMap;
