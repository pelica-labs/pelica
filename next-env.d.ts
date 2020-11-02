/// <reference types="next" />
/// <reference types="next/types/global" />

import { Session } from "next-iron-session";

declare module "http" {
  interface IncomingMessage {
    session: Session;
  }
}

declare module "next-auth" {
  interface User {
    id: string;
  }
}
