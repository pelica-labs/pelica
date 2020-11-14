import { NextPage } from "next";
import React from "react";

import { Whoops } from "~/components/layout/Whoops";

const FourOhFourPage: NextPage = () => {
  return <Whoops statusCode={404} />;
};

export default FourOhFourPage;
