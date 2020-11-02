import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Container } from "~/components/Container";
import { Footer } from "~/components/Footer";
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
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
