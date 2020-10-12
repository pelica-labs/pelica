import AWS from "aws-sdk";
import { format } from "date-fns";
import { File, IncomingForm } from "formidable";
import fs from "fs";
import HttpStatus from "http-status-codes";
import { NextApiHandler, NextApiRequest } from "next";
import uniqid from "uniqid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_S3_REGION,
});

const generateUniqueFilePath = () => {
  const prefix = process.env.VERCEL_URL || `local-${process.env.USER}`;
  const date = format(new Date(), "yyyyMMddHHmmss");
  const id = uniqid().toUpperCase();

  return `${prefix}/maps/${date}-${id}.jpeg`;
};

const parseUpload = (req: NextApiRequest): Promise<File> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error);
      }

      resolve(files.image);
    });
  });
};

const UploadMap: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      error: "Method not allowed",
    });
  }

  const image = await parseUpload(req);

  const upload = await s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: generateUniqueFilePath(),
      Body: fs.createReadStream(image.path),
    })
    .promise();

  return res.status(HttpStatus.CREATED).json({
    url: upload.Location,
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default UploadMap;
