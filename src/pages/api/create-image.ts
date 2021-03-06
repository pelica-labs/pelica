import HttpStatus from "http-status-codes";
import { NextApiHandler } from "next";

import { ImageModel } from "~/core/db";
import { dynamo } from "~/lib/aws";
import { stringId } from "~/lib/id";

const CreateImage: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const mapId = req.body.mapId;
  const id = stringId();

  const image: ImageModel = {
    id,
    mapId,
    createdAt: Date.now(),
  };

  await dynamo
    .put({
      TableName: "images",
      Item: image,
    })
    .promise();

  return res.status(HttpStatus.CREATED).json({
    id,
  });
};

export default CreateImage;
