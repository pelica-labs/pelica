import { ServerResponse } from "http";

export type EmptyProps = Record<string, unknown>;

export const redirect = (res: ServerResponse, to: string): { props: EmptyProps } => {
  res.statusCode = 302;
  res.setHeader("Location", to);

  return { props: {} };
};
