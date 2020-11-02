import { NextApiHandler } from "next";
import NextAuth from "next-auth";
import DynamoDbAdapter from "next-auth-dynamodb";
import Providers from "next-auth/providers";

import { mergeAnonymousAccount } from "~/lib/auth";
import { getEnv } from "~/lib/config";
import { withApiSession } from "~/lib/session";

const Handler: NextApiHandler = withApiSession((req, res) =>
  NextAuth(req, res, {
    providers: [
      Providers.Google({
        clientId: getEnv("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID),
        clientSecret: getEnv("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET),
      }),
    ],
    adapter: DynamoDbAdapter,

    callbacks: {
      session: async (session, user) => {
        session.user.id = user.id;

        await mergeAnonymousAccount(req, user);

        return session;
      },
    },
  })
);

export default Handler;
