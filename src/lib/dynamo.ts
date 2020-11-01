import AWS from "aws-sdk";

import { getEnv } from "~/lib/config";

export const dynamo = new AWS.DynamoDB.DocumentClient({
  accessKeyId: getEnv("AWS_KEY", process.env.AWS_KEY),
  secretAccessKey: getEnv("AWS_SECRET", process.env.AWS_SECRET),
  region: getEnv("AWS_DYNAMO_REGION", process.env.AWS_DYNAMO_REGION),
});
