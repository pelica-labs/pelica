import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { getUserId, withApiSession } from "~/lib/session";

const SyncMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const userId = await getUserId(req);
  if (!userId) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      error: "Unauthorized",
    });
  }

  const payload = req.body as MapModel;

  if (userId !== payload.userId) {
    return res.status(HttpStatus.FORBIDDEN).json({
      error: "Forbidden",
    });
  }

  await dynamo
    .put({
      TableName: "maps",
      Item: {
        ...payload,
        updatedAt: Date.now(),
      },
    })
    .promise();

  return res.status(HttpStatus.OK).json({
    message: "Map updated",
  });
});

export default SyncMap;
