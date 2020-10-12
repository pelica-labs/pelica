import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col">
      <span>Landing</span>
      <Link href="/app">
        <a className="underline">App</a>
      </Link>
    </div>
  );
};

export default Home;
