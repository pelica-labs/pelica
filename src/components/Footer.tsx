import { signIn } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 text-sm">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex flex-wrap gap-10 px-4">
          <div className="flex flex-col h-full justify-between flex-1 px- md:px-0">
            <Link passHref href="/">
              <a className="flex items-center">
                <Image height={48} src="/images/icon-512.png" width={48} />
                <span className="ml-4 text-2xl font-raleway font-bold">Pelica</span>
              </a>
            </Link>
            <div className="flex flex-col text-sm mt-4 md:mt-8 ml-3">
              <span className="border-l-2 border-gray-600 pl-2 leading-tight italic">
                Geographers never get lost.
                <br />
                They just do accidental field work.
              </span>
              <span className="mt-1 ml-1">Nicholas Chrisman</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col space-y-1 mr-12 ml-4">
              <span className="text-gray-300 font-medium mb-4">Company</span>

              <a className="hover:underline" href="https://twitter.com/PelicaLabs">
                Twitter
              </a>
              <a className="hover:underline" href="https://instagram.com/PelicaLabs">
                Instagram
              </a>
              <a className="hover:underline" href="https://github.com/pelica-labs">
                GitHub
              </a>
              <a className="hover:underline" href="mailto:hey@pelica.co">
                Email support
              </a>
            </div>

            <div className="flex flex-col space-y-1 ml-4">
              <span className="text-gray-300 font-medium mb-4">Product</span>
              <Link passHref href="/">
                <a className="hover:underline">Home</a>
              </Link>
              <a
                className="hover:underline"
                href="#"
                onClick={() => {
                  signIn("google");
                }}
              >
                Sign in
              </a>
              <Link passHref href="/terms">
                <a className="hover:underline">Terms of Service</a>
              </Link>
              <Link passHref href="/privacy">
                <a className="hover:underline">Privacy Policy</a>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 px-8 md:px-4">© {new Date().getFullYear()} Pelica Labs</div>
      </div>
    </footer>
  );
};
