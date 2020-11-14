import { NextPage } from "next";
import React from "react";

import { Whoops } from "~/components/layout/Whoops";

interface Props {
  statusCode?: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
  return <Whoops statusCode={statusCode} />;
};

Error.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
