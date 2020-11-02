import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { MapModel } from "~/lib/db";
import { dynamo } from "~/lib/dynamo";
import { uniqueId } from "~/lib/id";
import { initializeAnonymousSession, withApiSession } from "~/lib/session";

const CreateMap: NextApiHandler = withApiSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const id = uniqueId();
  const userId = await initializeAnonymousSession(req);

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
