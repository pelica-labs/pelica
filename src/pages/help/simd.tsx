import { NextPage } from "next";
import Image from "next/image";
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
        <div>
          <Copy.Title>Enabling SIMD for faster video exports</Copy.Title>

          <Copy.Paragraph>
            WebAssembly{" "}
            <Copy.Link href="https://en.wikipedia.org/wiki/SIMD" target="_blank">
              SIMD
            </Copy.Link>{" "}
            is an experimental web feature that can be used to increase computational speeds in the browser. For Pelica,
            it can especially be used to make video exports about <span className="font-medium">2 times faster</span>.
          </Copy.Paragraph>

          <Copy.Paragraph>
            As of now, it's only available in Chromium based browsers such as{" "}
            <span className="font-medium">Google Chrome</span>.
          </Copy.Paragraph>

          <Copy.Subtitle>Instructions</Copy.Subtitle>

          <Copy.Paragraph>
            1. Head to{" "}
            <Copy.Link href="chrome://flags" target="_blank">
              chrome://flags
            </Copy.Link>{" "}
            in your web browser.
          </Copy.Paragraph>

          <Copy.Paragraph>
            2. In the search bar at the top, type "simd". You should then see the "WebAssembly SIMD support" entry.
          </Copy.Paragraph>

          <Copy.Paragraph>3. Use the menu at the right to enable support.</Copy.Paragraph>

          <Image height={212} src="/images/help/simd.png" width={1506} />

          <Copy.Paragraph>4. If instructed, restart your browser.</Copy.Paragraph>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default Simd;
