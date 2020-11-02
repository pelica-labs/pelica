import AWS from "aws-sdk";

import { getAwsCredentials } from "~/lib/config";

export const s3 = new AWS.S3(getAwsCredentials());

export const generateFilePrefix = (folder: string): string => {
  return process.env.NODE_ENV + (process.env.USER ? `-${process.env.USER}` : "") + "/" + folder + "/";
};
