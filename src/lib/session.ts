import { IncomingMessage } from "http";
import { GetServerSideProps, NextApiHandler } from "next";
import { withIronSession } from "next-iron-session";

import { getEnv } from "~/lib/config";
import { ID, uniqueId } from "~/lib/id";

export type Session = {
  userId: ID;
};

export const withSession = <T>(handler: GetServerSideProps<T>): GetServerSideProps<T> => {
  return withIronSession(handler, {
    password: getEnv("COOKIE_PASSWORD", process.env.COOKIE_PASSWORD),
    cookieName: "pelica.co",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  });
};

export const withApiSession = (handler: NextApiHandler): NextApiHandler => {
  return withIronSession(handler, {
    password: getEnv("COOKIE_PASSWORD", process.env.COOKIE_PASSWORD),
    cookieName: "pelica.co",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  });
};

export const initializeSession = async (req: IncomingMessage): Promise<ID> => {
  let userId = req.session.get("userId");

  if (userId === undefined) {
    userId = uniqueId();
    req.session.set("userId", userId);
    await req.session.save();
  }

  return userId;
};

export const impersonate = async (req: IncomingMessage, userId: ID): Promise<void> => {
  req.session.set("userId", userId);
  await req.session.save();
};
