import AWS from "aws-sdk";

import { getEnv } from "~/lib/config";

type AwsCredentials = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/**
 * AWS environment variables are prefixed with `OMANYD` for 2 reasons:
 * - Automatic configuration required by `next-auth-dynamodb > omanyd`
 * - Avoid name clash with standard AWS_* variables on Vercel
 */
const credentials: AwsCredentials = {
  region: getEnv("OMANYD_AWS_REGION", process.env.OMANYD_AWS_REGION),
  accessKeyId: getEnv("OMANYD_AWS_ACCESS_KEY_ID", process.env.OMANYD_AWS_ACCESS_KEY_ID),
  secretAccessKey: getEnv("OMANYD_AWS_SECRET_ACCESS_KEY", process.env.OMANYD_AWS_SECRET_ACCESS_KEY),
};

export const s3 = new AWS.S3(credentials);

export const dynamo = new AWS.DynamoDB.DocumentClient(credentials);
