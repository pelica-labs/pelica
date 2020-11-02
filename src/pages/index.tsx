import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Container } from "~/components/Container";
import { Footer } from "~/components/Footer";
import { DownloadIcon, ExportIcon, PinIcon, StyleIcon } from "~/components/Icon";
import { Navbar } from "~/components/Navbar";

const Home: NextPage = () => {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const images = ["/images/og-image.jpg", "/images/index/carousel1.jpg", "/images/index/carousel2.jpg"];
  const router = useRouter();

  const createMap = async () => {
    setCreating(true);
    const res = await fetch("/api/create-map", {
      method: "POST",
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  // rotate the images
  const [currentImage, setCurrentImage] = useState<number>(0);
  useEffect(() => {
    if (typeof window !== undefined) {
      const timeout = window.setTimeout(() => {
        setCurrentImage(currentImage + 1);
      }, 7000);
      return () => window.clearTimeout(timeout);
    }
  }, [currentImage]);

  // preload images
  useEffect(() => {
    images.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  return (
    <div className="absolute h-full w-full overflow-y-scroll z-50 text-lg text-gray-900">
      <Navbar />

      <Container>
        <h1 className="text-center text-5xl text-gray-900 font-raleway mb-6 font-bold">{t("tagline")}</h1>
        <h2 className="font-raleway text-2xl text-center">Pelica is a tool to edit, style, and share custom maps.</h2>

        <div
          className="relative w-full mt-6 overflow-hidden rounded-lg border-2 border-gray-600 border-opacity-25"
          style={{ height: "32rem" }}
        >
          <AnimatePresence>
            <motion.img
              key={images[currentImage % images.length]}
              animate={{ x: 0, opacity: 1 }}
              className="w-full h-full object-cover object-center absolute top-0 rounded"
              exit={{ x: -300, opacity: 0 }}
              initial={{ x: 300, opacity: 0 }}
              src={images[currentImage % images.length]}
              transition={{ duration: 1, stiffness: 0.2 }}
            />
          </AnimatePresence>
          <div
            className="absolute w-full bottom-0 flex justify-center rounded-b"
            style={{ background: `linear-gradient(rgba(0,0,0,0), rgba(28, 25, 23, 0.5))` }}
          >
            <button
              className="h-12 mb-6 mt-12 bg-orange-600 hover:bg-orange-500 shadow transition duration-300 ease-in-out text-gray-100 px-6 py-1 rounded-full uppercase tracking-wider font-bold hover:scale-105 hover:shadow transform hover:-translate-y-1 focus:outline-none focus:shadow-outline"
              disabled={creating}
              onClick={() => {
                createMap();
              }}
            >
              {creating ? "Creating map..." : "Start mapping"}
            </button>
          </div>
        </div>

        <Features />
      </Container>

      <Footer />
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
                  <p className="mt-2 text-base leading-6 text-gray-500">
                    Select from a list of pre-designed styles. Your maps will look good no matter what.
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
                  <h4 className="text-lg leading-6 font-medium text-gray-900">Simple yet powerful drawing tools</h4>
                  <p className="mt-2 text-base leading-6 text-gray-500">
                    Draw routes, add pins, write texts. That's about it.
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
                  <p className="mt-2 text-base leading-6 text-gray-500">
                    Share interactive maps or just raw images right from the app.
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
                  <p className="mt-2 text-base leading-6 text-gray-500">
                    Generate high res images, suited for print / professional work. Don't compromise on quality.
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

export default Home;
