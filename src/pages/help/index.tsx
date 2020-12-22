import { NextPage } from "next";
import Link from "next/link";
import React from "react";

import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";
import { Container } from "~/components/ui/Container";
import * as Copy from "~/components/ui/Copy";

const Simd: NextPage = () => {
  return (
    <div className="absolute h-full w-full overflow-y-scroll z-50 text-lg text-gray-900">
      <Navbar href="/help" title="Help Center" />

      <Container dense>
        <div className="text-sm self-start">
          <Copy.Subtitle>Articles</Copy.Subtitle>

          <Link passHref href="/help/simd">
            <Copy.Link>Enabling SIMD for faster video exports</Copy.Link>
          </Link>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default Simd;
