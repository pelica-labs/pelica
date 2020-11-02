import { GetServerSideProps, NextPage } from "next";
import { signIn, useSession } from "next-auth/client";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import useSWR from "swr";

import { MapPlusIcon } from "~/components/Icon";
import { MapPreview, MapPreviewLoading } from "~/components/MapPreview";
import { Navbar } from "~/components/Navbar";
import { GoogleButton } from "~/components/SocialButtons";
import { MapModel } from "~/lib/db";

type Props = {
  maps: MapModel[];
};

const Maps: NextPage<Props> = () => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const [session, loading] = useSession();

  const { data, revalidate } = useSWR<Props>("/api/list-maps");

  const createMap = async () => {
    setCreating(true);
    const res = await fetch("/api/create-map", {
      method: "POST",
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  return (
    <div className="bg-gray-100 pb-8">
      <Navbar />

      {!session && !loading && (
        <div className="container mx-auto mt-8 px-3 flex items-center justify-between gap-4 flex-wrap bg-white shadow rounded-lg py-2 max-w-4xl">
          <div className="flex flex-col">
            <span className="text-lg">Don't lose your hard work!</span>
            <span className="text-sm">Create a Pelica account to save your maps and access them from anywhere.</span>
          </div>

          <GoogleButton
            onClick={() => {
              signIn("google");
            }}
          />
        </div>
      )}

      <div className="mt-8 container mx-auto max-w-4xl">
        <div className="flex items-center justify-between px-1">
          <h1 className="px-2 text-2xl">Saved maps</h1>
          <button
            className="w-12 h-12 flex items-center justify-center bg-orange-600 hover:bg-orange-500 shadow transition duration-300 ease-in-out text-gray-100 px-3 py-1 rounded-full uppercase tracking-wider font-medium hover:scale-105 hover:shadow focus:outline-none focus:shadow-outline text-sm"
            disabled={creating}
            onClick={() => {
              createMap();
            }}
          >
            {creating ? "Creating map..." : <MapPlusIcon className="w-8 h-8" />}
          </button>
        </div>
        {data ? (
          <div className="mt-4 flex flex-wrap">
            {!data.maps.length && (
              <div className="w-full h-64 flex items-center justify-center text-gray-600 mt-10 gap-10 px-4 flex-wrap">
                <div className="w-64">
                  <Image height={862} src="/images/404.svg" width={1132} />
                </div>
                <span>You haven't created any maps yet.</span>
              </div>
            )}

            {data.maps.map((map) => {
              return (
                <MapPreview
                  key={map.id}
                  map={map}
                  onMapDeleted={() => {
                    revalidate();
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap">
            <MapPreviewLoading />
          </div>
        )}
      </div>
    </div>
  );
};

export default Maps;
