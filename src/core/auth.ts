import { IncomingMessage } from "http";
import { User } from "next-auth";

import { MapModel } from "~/core/db";
import { clearAnonymousSession, getAnonymousUserId } from "~/core/session";
import { dynamo } from "~/lib/aws";

/**
 * Called after a session check is performed (e.g: after sign-up / sign-in).
 * If an anonymous session is currently active, fetch all maps in the database and reassign them to the new user.
 */
export const mergeAnonymousAccount = async (req: IncomingMessage, user: User): Promise<void> => {
  const anonymousUserId = getAnonymousUserId(req);
  if (!anonymousUserId) {
    return;
  }

  // @todo: this looks like a terrible implementation and probably could be done in a single call.

  /**
   * Fetch all maps belonging to the current anonymous user.
   */
  const response = await dynamo
    .scan({
      TableName: "maps",
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": anonymousUserId,
      },
    })
    .promise();
  const anonymousMaps = response.Items as MapModel[];

  await Promise.all(
    anonymousMaps.map(async (map) => {
      /**
       * Delete them
       */
      await dynamo
        .delete({
          TableName: "maps",
          Key: { id: map.id },
        })
        .promise();

      /**
       * Recreate them with the new user.
       */
      await dynamo
        .put({
          TableName: "maps",
          Item: {
            ...map,
            userId: user.id,
          },
        })
        .promise();
    })
  );

  /**
   * Delete the anonymous session
   */
  await clearAnonymousSession(req);
};
