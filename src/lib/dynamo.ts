import AWS from "aws-sdk";

import { getAwsCredentials } from "~/lib/config";

export const dynamo = new AWS.DynamoDB.DocumentClient(getAwsCredentials());
