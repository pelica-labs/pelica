import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";
import { Container } from "~/components/ui/Container";
import { DownloadIcon, ExportIcon, PinIcon, StyleIcon } from "~/components/ui/Icon";

const Home: NextPage = () => {
  const { t } = useTranslation();

  return (
    <div className="absolute h-full w-full overflow-y-scroll z-50 text-lg text-gray-900">
      <Navbar />

      <Container>
        <h1 className="text-center text-5xl text-gray-900 font-raleway mb-6 font-bold">{t("tagline")}</h1>
        <h2 className="font-light font-raleway text-2xl text-center">
          Pelica is a tool to edit, style, and share custom maps.
        </h2>

        <Carousel />

        <Features />

        <Showcase />

        <StartMappingButton />
      </Container>

      <Footer />
    </div>
  );
};

const Carousel: React.FC = () => {
  return (
    <div className="relative">
      <video
        autoPlay
        loop
        muted
        poster="/images/index/frame.jpg"
        className="relative w-full mt-6 overflow-hidden rounded-lg border-2 border-gray-600 border-opacity-25"
      >
        <source src="/images/index/demo.mp4" type="video/mp4" />
      </video>
      <div
        className="absolute w-full bottom-0 flex justify-center rounded-b"
        style={{ background: `linear-gradient(rgba(0,0,0,0), rgba(28, 25, 23, 0.5))` }}
      >
        <StartMappingButton />
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <div className="mt-20 py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h3 className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 font-raleway">
            The easiest way to design maps
          </h3>
        </div>

        <div className="mt-16">
          <ul className="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <li>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-400 text-white rounded">
                    <StyleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg leading-6 font-medium text-gray-900">Beautiful curated styles</h4>
                  <p className="mt-2 text-base leading-6 text-gray-600">
                    Select from a list of styles designed by cartographers. Your maps will look good no matter what.
                  </p>
                </div>
              </div>
            </li>
            <li className="mt-10 md:mt-0">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-400 text-white rounded">
                    <PinIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg leading-6 font-medium text-gray-900">Simple and powerful drawing tools</h4>
                  <p className="mt-2 text-base leading-6 text-gray-600">
                    Draw routes, add pins, write text, and customize it all.
                  </p>
                </div>
              </div>
            </li>
            <li className="mt-10 md:mt-0">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-400 text-white rounded">
                    <ExportIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg leading-6 font-medium text-gray-900">Built for sharing</h4>
                  <p className="mt-2 text-base leading-6 text-gray-600">
                    Share interactive maps or exported images & videos right from the app.
                  </p>
                </div>
              </div>
            </li>
            <li className="mt-10 md:mt-0">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-400 text-white rounded">
                    <DownloadIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg leading-6 font-medium text-gray-900">High resolution exports</h4>
                  <p className="mt-2 text-base leading-6 text-gray-600">
                    Generate HD images & videos, suited for print and professional work. Don't compromise on quality.
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Showcase: React.FC = () => {
  return (
    <div className="mt-20 py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h3 className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 font-raleway">
            Made with Pelica
          </h3>
        </div>
      </div>

      <div className="mt-20 flex flex-col space-y-16">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-8 md:space-y-0 items-start">
          <span className="pl-4 border-l-4 border-orange-400 leading-6 text-gray-900 font-medium md:mt-2">
            Create customized maps for your runs & hikes
          </span>
          <div className="inline-flex border-4 border-opacity-50 rounded shadow">
            <Image height={600} src="/images/og-image.jpg" width={900} />
          </div>
        </div>

        <div className="flex flex-col-reverse space-y-reverse space-y-4 md:flex-row md:space-x-8 md:space-y-2 items-start">
          <div className="inline-flex border-4 border-opacity-50 rounded shadow">
            <Image height={600} src="/images/index/showcase-3d.jpeg" width={600} />
          </div>

          <span className="pl-4 border-l-4 border-orange-400 leading-6 text-gray-900 font-medium">
            Use satellite imagery for beautiful 3D images
          </span>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:space-x-8 md:space-y-0 items-start">
          <span className="pl-4 border-l-4 border-orange-400 leading-6 text-gray-900 font-medium md:mt-2">
            Create scenes in just a few clicks
          </span>
          <div className="inline-flex border-4 border-opacity-50 rounded shadow">
            <video autoPlay loop muted>
              <source src="/images/index/showcase-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

const StartMappingButton: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createMap = async () => {
    setCreating(true);
    const res = await fetch("/api/create-map", {
      method: "POST",
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  return (
    <button
      aria-label="Start mapping"
      className="h-12 mb-6 mt-12 bg-orange-600 hover:bg-orange-500 shadow transition duration-300 ease-in-out text-white px-6 py-1 rounded-full uppercase tracking-wider font-bold hover:scale-105 hover:shadow transform hover:-translate-y-1 focus:outline-none focus:ring"
      disabled={creating}
      onClick={() => {
        createMap();
      }}
    >
      {creating ? "Creating map..." : "Start mapping"}
    </button>
  );
};

export default Home;
