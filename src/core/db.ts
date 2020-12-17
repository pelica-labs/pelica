import { Position } from "@turf/turf";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { CoreEntity } from "~/core/entities";
import { dynamo } from "~/lib/aws";
import { ID } from "~/lib/id";
import { Style } from "~/map/style";

export type MapModel = {
  id: ID;
  userId: ID;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;

  name?: string;

  coordinates?: Position;
  zoom?: number;
  bearing?: number;
  pitch?: number;

  style?: Style;
  entities?: CoreEntity[];
};

export type ImageModel = {
  id: ID;
  mapId: ID;
  createdAt: number;

  path?: string;
  name?: string;
  size?: [number, number];
};

export const paginate = async <T>(input: DocumentClient.ScanInput): Promise<T[]> => {
  const items = [];
  let lastKey = null;

  do {
    const response: DocumentClient.ScanOutput = await dynamo
      .scan({
        ...input,
        ...(lastKey && {
          ExclusiveStartKey: lastKey,
        }),
      })
      .promise();

    items.push(...(response?.Items ?? []));
    lastKey = response.LastEvaluatedKey;
  } while (!!lastKey);

  return (items as unknown) as T[];
};
