import AWS from "aws-sdk";
import { File, IncomingForm } from "formidable";
import fs from "fs";
import HttpStatus from "http-status-codes";
import { NextApiHandler, NextApiRequest } from "next";
import uniqid from "uniqid";

import { getEnv } from "~/lib/config";
import { generateFilePrefix } from "~/lib/s3";

const s3 = new AWS.S3({
  accessKeyId: getEnv("AWS_KEY", process.env.AWS_KEY),
  secretAccessKey: getEnv("AWS_SECRET", process.env.AWS_SECRET),
  region: getEnv("AWS_S3_REGION", process.env.AWS_S3_REGION),
});

const generateUniqueFilePath = () => {
  return uniqid().toUpperCase();
};

type UploadedMap = {
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

  const { name, image } = await parseUpload(req);
  const filePath = generateUniqueFilePath();
  const proxyPath = `${req.headers.host}/map/${filePath}`;
  const s3Path = generateFilePrefix("maps") + filePath + ".jpeg";

  await s3
    .upload({
      Bucket: getEnv("AWS_S3_BUCKET", process.env.AWS_S3_BUCKET),
      Key: s3Path,
      Body: fs.createReadStream(image.path),
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
