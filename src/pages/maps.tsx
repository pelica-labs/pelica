import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import useSWR from "swr";

import { MapPreview } from "~/components/MapPreview";
import { Navbar } from "~/components/Navbar";
import { MapModel } from "~/lib/db";
import { withSession } from "~/lib/session";
import { fetchMaps } from "~/pages/api/list-maps";

type Props = {
  maps: MapModel[];
};

export const getServerSideProps: GetServerSideProps<Props> = withSession(async (ctx) => {
  const maps = await fetchMaps(ctx.req);

  return {
    props: {
      maps,
    },
  };
});

const Maps: NextPage<Props> = ({ maps }) => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const { data, revalidate } = useSWR<Props>("/api/list-maps", {
    initialData: { maps },
  });

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

      {data && (
        <div className="mt-8 container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="px-2 text-2xl">Saved maps</h1>
            <button
              className="h-8 bg-orange-600 hover:bg-orange-500 shadow transition duration-300 ease-in-out text-gray-100 px-3 py-1 rounded-full uppercase tracking-wider font-medium hover:scale-105 hover:shadow focus:outline-none focus:shadow-outline text-sm"
              disabled={creating}
              onClick={() => {
                createMap();
              }}
            >
              {creating ? "Creating map..." : "Create a new map"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap">
            {!data.maps.length && (
              <div className="w-full h-64 flex items-center justify-center text-gray-600 mt-10 space-x-10">
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
        </div>
      )}
    </div>
  );
};

export default Maps;
