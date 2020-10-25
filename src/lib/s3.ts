import AWS from "aws-sdk";

import { getEnv } from "~/lib/config";

export const s3 = new AWS.S3({
  accessKeyId: getEnv("AWS_KEY", process.env.AWS_KEY),
  secretAccessKey: getEnv("AWS_SECRET", process.env.AWS_SECRET),
  region: getEnv("AWS_S3_REGION", process.env.AWS_S3_REGION),
});

export const generateFilePrefix = (folder: string): string => {
  return process.env.NODE_ENV + (process.env.USER ? `-${process.env.USER}` : "") + "/" + folder + "/";
};
