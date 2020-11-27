import { useSession } from "next-auth/client";
import Link from "next/link";
import React from "react";

import { GeolocationButton } from "~/components/map/GeolocationButton";
import { Map } from "~/components/map/Map";
import { PlaceAutocomplete } from "~/components/map/PlaceAutocomplete";
import { ResetOrientationButton } from "~/components/map/ResetOrientationButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { EditIcon } from "~/components/ui/Icon";
import { app, useStore } from "~/core/app";
import { MapModel } from "~/core/db";

type Props = {
  map: MapModel;
};

export const MapViewer: React.FC<Props> = ({ map }) => {
  const place = useStore((store) => store.map.place);
  const currentCoordinates = useStore((store) => store.map.coordinates);
  const currentZoom = useStore((store) => store.map.zoom);
  const [session] = useSession();

  return (
    <div className="flex flex-col md:flex-row h-full justify-between bg-gray-200">
      <div className="relative w-full h-full flex-1">
        <Map readOnly map={map} />
      </div>

      <div className="absolute top-0 left-0 flex flex-col space-y-2 mt-2 ml-2">
        <PlaceAutocomplete
          collapsesWhenEmpty
          bias={currentZoom > 10 && currentCoordinates ? currentCoordinates : undefined}
          value={place}
          onChange={(place) => {
            app.map.setPlace(place);
          }}
        />

        <GeolocationButton showOnMap />

        <ResetOrientationButton />
      </div>

      {session?.user.id === map.userId && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="w-40 mx-auto bg-white rounded-lg mb-2 shadow p-2 space-y-4 border-l-4 border-r-4 border-orange-400 flex flex-col items-center">
            <Heading>Preview mode</Heading>

            <Link href={`/app/${map.id}`}>
              <Button className="relative bg-white border border-gray-200 text-gray-800 shadow flex justify-center items-center transition-all duration-100 ease-in-out cursor-pointer rounded-full hover:border-orange-300">
                <EditIcon className="w-4 h-4" />
                <span className="ml-2 text-xs">Back to edition</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
