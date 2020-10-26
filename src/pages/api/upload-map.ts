import AWS from "aws-sdk";
import { File, IncomingForm } from "formidable";
import fs from "fs";
import HttpStatus from "http-status-codes";
import { NextApiHandler, NextApiRequest } from "next";

import { getEnv } from "~/lib/config";
import { generateFilePrefix } from "~/lib/s3";

const s3 = new AWS.S3({
  accessKeyId: getEnv("AWS_KEY", process.env.AWS_KEY),
  secretAccessKey: getEnv("AWS_SECRET", process.env.AWS_SECRET),
  region: getEnv("AWS_S3_REGION", process.env.AWS_S3_REGION),
});

type UploadedMap = {
  id: string;
  image: File;
  name?: string;
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

  const { id, name, image } = await parseUpload(req);
  const proxyPath = `${req.headers.host}/map/${id}`;
  const s3Path = generateFilePrefix("maps") + id + ".jpeg";

  const existingImage = await s3
    .headObject({ Bucket: bucket, Key: s3Path })
    .promise()
    .catch(() => {
      // Expected to throw
    });
  if (existingImage) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: "File already exists",
    });
  }

  await s3
    .upload({
      Bucket: bucket,
      Key: s3Path,
      Body: fs.createReadStream(image.path),
      ContentType: "image/jpeg",
      Metadata: {
        ...(name && { name }),
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
