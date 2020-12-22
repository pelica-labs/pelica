import { File, IncomingForm } from "formidable";
import fs from "fs";
import HttpStatus from "http-status-codes";
import { NextApiHandler, NextApiRequest } from "next";

import { dynamo, s3 } from "~/lib/aws";
import { getEnv } from "~/lib/config";

type UploadedMap = {
  id: string;
  image: File;
  name?: string;
  size: [number, number];
};

const generateFilePrefix = (folder: string): string => {
  return process.env.NODE_ENV + (process.env.USER ? `-${process.env.USER}` : "") + "/" + folder + "/";
};

const parseUpload = (req: NextApiRequest): Promise<UploadedMap> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error);
      }

      resolve({
        id: fields.id as string,
        image: files.image,
        name: fields.name as string | undefined,
        size: [parseInt(fields.width as string), parseInt(fields.height as string)],
      });
    });
  });
};

const UploadMap: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const bucket = getEnv("AWS_S3_BUCKET", process.env.AWS_S3_BUCKET);

  const { id, name, image, size } = await parseUpload(req);
  const proxyPath = `${req.headers.host}/map/${id}`;
  const path = generateFilePrefix("maps") + id + ".png";

  const existingImage = await dynamo
    .get({
      TableName: "images",
      Key: { id },
    })
    .promise();

  if (!existingImage.Item) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: "Image hasn't been initialised properly",
    });
  }

  if (existingImage.Item.path) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: "File already exists",
    });
  }

  await s3
    .upload({
      Bucket: bucket,
      Key: path,
      Body: fs.createReadStream(image.path),
      ContentType: "image/png",
    })
    .promise();

  await dynamo
    .put({
      TableName: "images",
      Item: {
        ...existingImage.Item,
        name,
        size,
        path,
      },
    })
    .promise();

  return res.status(HttpStatus.CREATED).json({
    url: proxyPath,
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default UploadMap;
