import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { readableUniqueId } from "~/lib/id";
import { getUserId, withApiSession } from "~/lib/session";

const CreateMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const id = readableUniqueId();
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
