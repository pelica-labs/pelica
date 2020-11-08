import Link from "next/link";
import React from "react";
import statusCodes from "status-codes";

import { Container } from "~/components/Container";
import { Footer } from "~/components/Footer";
import { Navbar } from "~/components/Navbar";

export const Whoops: React.FC<{ statusCode?: number }> = ({ statusCode }) => {
  return (
    <div className="absolute min-h-full w-full overflow-y-scroll bg-gray-100 z-50 text-lg text-gray-900">
      <Navbar />

      <Container>
        {statusCode === 404 ? (
          <>
            <h1 className="text-center text-5xl text-gray-900 font-raleway mb-6 font-bold">There's nothing here.</h1>
            <h2 className="font-raleway text-2xl text-center">This page was not found.</h2>
          </>
        ) : statusCode ? (
          <>
            <h1 className="text-center text-5xl text-gray-900 font-raleway mb-6 font-bold">Whoops!</h1>
            <h2 className="font-raleway text-2xl text-center">
              There was an error {statusCode}. {statusCodes[statusCode]?.message}
            </h2>
          </>
        ) : (
          <>
            <h1 className="text-center text-5xl text-gray-900 font-raleway mb-6 font-bold">Whoops!</h1>
            <h2 className="font-raleway text-2xl text-center">An unexpected error occured. We'll look into it.</h2>
          </>
        )}

        <div className="w-3/4 max-w-sm my-6">
          <img src="/images/404.svg" />
        </div>
        <Link passHref href="/app">
          <button className="h-12 mb-6 mt-12 bg-orange-600 hover:bg-orange-500 shadow transition duration-300 ease-in-out text-gray-100 px-6 py-1 rounded-full uppercase tracking-wider font-bold hover:scale-105 hover:shadow transform hover:-translate-y-1 focus:outline-none focus:shadow-outline">
            Start mapping
          </button>
        </Link>
      </Container>

      <Footer />
    </div>
  );
};
