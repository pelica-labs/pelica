import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { dynamo } from "~/lib/dynamo";
import { getUserId, withApiSession } from "~/lib/session";

const DeleteMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const id = req.body.id;
  const userId = await getUserId(req);

  await dynamo
    .delete({
      TableName: "maps",
      Key: { id, userId },
    })
    .promise();

  return res.status(HttpStatus.OK).json({
    message: "Map deleted",
  });
});

export default DeleteMap;
