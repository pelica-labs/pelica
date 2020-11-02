import { NextPage } from "next";
import React from "react";

import { Container } from "~/components/Container";
import { Footer } from "~/components/Footer";
import { Navbar } from "~/components/Navbar";

const Terms: NextPage = () => {
  return (
    <div className="absolute h-full w-full overflow-y-scroll z-50 text-lg text-gray-900">
      <Navbar />

      <Container>
        <span className="text-3xl">Privacy Policy</span>

        <span className="mt-10">WIP</span>
      </Container>

      <Footer />
    </div>
  );
};

export default Terms;
