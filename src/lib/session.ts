import { IncomingMessage } from "http";
import { GetServerSideProps, NextApiHandler } from "next";
import { getSession } from "next-auth/client";
import { withIronSession } from "next-iron-session";

import { getEnv } from "~/lib/config";
import { ID, stringId } from "~/lib/id";

const SESSION_KEY = "pelica-anonymous-session";

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

export const getUserId = async (req: IncomingMessage): Promise<ID> => {
  const session = await getSession({ req });

  if (session) {
    return session.user.id;
  }

  return getAnonymousUserId(req);
};

export const getAnonymousUserId = (req: IncomingMessage): ID => {
  return req.session.get(SESSION_KEY) as ID;
};

export const initializeAnonymousSession = async (req: IncomingMessage): Promise<ID> => {
  let userId = req.session.get(SESSION_KEY);

  if (userId === undefined) {
    userId = stringId();
    req.session.set(SESSION_KEY, userId);
    await req.session.save();
  }

  return userId;
};

export const clearAnonymousSession = async (req: IncomingMessage): Promise<void> => {
  req.session.unset(SESSION_KEY);

  await req.session.save();
};

export const impersonate = async (req: IncomingMessage, userId: ID): Promise<void> => {
  req.session.set(SESSION_KEY, userId);
  await req.session.save();
};
