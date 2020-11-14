import AWS from "aws-sdk";

import { getAwsCredentials } from "~/lib/config";

const credentials = getAwsCredentials();

export const s3 = new AWS.S3(credentials);

export const dynamo = new AWS.DynamoDB.DocumentClient(credentials);
