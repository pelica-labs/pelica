import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Navbar } from "~/components/Navbar";

const FourOhFour: NextPage = () => {
  return (
    <div className="absolute h-full w-full overflow-y-scroll bg-gray-100 z-50 text-lg text-gray-900">
      <Navbar />

      <div className="flex flex-col items-center justify-center max-w-4xl my-12 mx-auto px-4">
        <h1 className="text-center text-5xl text-gray-900 font-raleway mb-6 font-bold">There&apos;s nothing here.</h1>
        <h2 className="font-raleway text-2xl text-center">This page was not found.</h2>

        <div className="w-3/4 max-w-sm my-6">
          <Image height={862} src="/images/404.svg" width={1132} />
        </div>
        <Link passHref href="/app">
          <button className="h-12 mb-6 mt-12 bg-orange-600 hover:bg-orange-500 shadow transition duration-300 ease-in-out text-gray-100 px-6 py-1 rounded-full uppercase tracking-wider font-bold hover:scale-105 hover:shadow transform hover:-translate-y-1 focus:outline-none focus:shadow-outline">
            Start mapping
          </button>
        </Link>
      </div>
    </div>
  );
};

export default FourOhFour;
