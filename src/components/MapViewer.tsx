import { useSession } from "next-auth/client";
import Link from "next/link";
import React, { useEffect } from "react";

import { Button } from "~/components/Button";
import { GeolocationButton } from "~/components/GeolocationButton";
import { EditIcon } from "~/components/Icon";
import { Map } from "~/components/Map";
import { PlaceAutocomplete } from "~/components/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/ResetOrientationButton";
import { app, useStore } from "~/core/app";
import { MapModel } from "~/lib/db";

type Props = {
  map: MapModel;
};

export const MapViewer: React.FC<Props> = ({ map }) => {
  const place = useStore((store) => store.map.place);
  const currentLocation = useStore((store) => store.geolocation.currentLocation);
  const [session] = useSession();

  useEffect(() => {
    app.sync.mergeState(map);
    app.editor.setReadOnly(true);

    setTimeout(() => {
      app.entities.forceRerender();
    });
  }, [map]);

  return (
    <div className="flex flex-col md:flex-row h-full justify-between bg-gray-200">
      <div className="relative w-full h-full flex-1">
        <Map readOnly />
      </div>

      <div className="absolute top-0 left-0 flex flex-col space-y-2 mt-2 ml-2">
        <PlaceAutocomplete
          collapsesWhenEmpty
          bias={currentLocation ?? undefined}
          value={place}
          onChange={(place) => {
            app.map.setPlace(place);
          }}
        />

        <GeolocationButton
          onChange={(coordinates) => {
            app.map.move(coordinates, 16, 0, 0);
          }}
        />

        <ResetOrientationButton />
      </div>

      {session?.user.id === map.userId && (
        <div className="absolute top-0 right-0 flex flex-col space-y-2 mt-2 mr-2">
          <Link href={`/app/${map.id}`}>
            <Button className="px-4 h-12 relative bg-white border border-gray-200 text-gray-800 shadow flex justify-center items-center transition-all duration-100 ease-in-out cursor-pointer rounded-full hover:border-orange-300">
              <EditIcon className="w-6 h-6" />
              <span className="ml-4">Edit</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
