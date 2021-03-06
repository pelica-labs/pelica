import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { MapModel } from "~/core/db";
import { getUserId, withApiSession } from "~/core/session";
import { dynamo } from "~/lib/aws";
import { stringId } from "~/lib/id";

const CreateMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const id = stringId();
  const userId = await getUserId(req);

  const map: MapModel = {
    id,
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await dynamo
    .put({
      TableName: "maps",
      Item: map,
    })
    .promise();

  return res.status(HttpStatus.CREATED).json({
    id,
  });
});

export default CreateMap;
