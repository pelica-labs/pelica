import { ServerResponse } from "http";

type EmptyProps = {
  props: Record<string, never>;
};

export const redirect = (res: ServerResponse, to: string): EmptyProps => {
  res.statusCode = 302;
  res.setHeader("Location", to);

  return { props: {} };
};
