import classNames from "classnames";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";

import { Button } from "~/components/ui/Button";
import { TargetIcon } from "~/components/ui/Icon";
import { useStore } from "~/core/app";
import { theme } from "~/styles/tailwind";

type GeolocationStatus = "active" | "inactive" | "loading" | "declined";

type Props = {
  showOnMap?: boolean;
};

export const GeolocationButton: React.FC<Props> = ({ showOnMap = false }) => {
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>("inactive");
  const [geolocate, setGeolocate] = useState<(mapboxgl.GeolocateControl & { _watchState?: string }) | null>(null);
  // we have to do this because there's no statechange event yet https://github.com/mapbox/mapbox-gl-js/issues/5136
  const [watchTrigger, setWatchTrigger] = useState<number>(0);
  const map = useStore((state) => state.map.current);

  useEffect(() => {
    switch (geolocate?._watchState) {
      case "OFF":
        setGeolocationStatus("inactive");
        break;
      case "ACTIVE_LOCK":
        setGeolocationStatus("active");
        break;
      case "BACKGROUND":
        setGeolocationStatus("inactive");
        break;
      case "WAITING_ACTIVE":
        setGeolocationStatus("loading");
        geolocate.on("geolocate", () => setWatchTrigger(watchTrigger + 1));
        break;
      default:
        break;
    }
  }, [geolocate, watchTrigger]);

  useEffect(() => {
    if (map) {
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: showOnMap,
        showAccuracyCircle: showOnMap,
        fitBoundsOptions: { maxZoom: 16 },
      });
      map.addControl(geolocate);
      setGeolocate(geolocate);

      // when declined, set status as declined
      geolocate.on("error", () => setGeolocationStatus("declined"));
      // watch all events and trigger the watch hook
      geolocate.on("geolocate", () => setWatchTrigger(watchTrigger + 1));
      geolocate.on("trackuserlocationstart", () => setWatchTrigger(watchTrigger + 1));
      geolocate.on("trackuserlocationend", () => setWatchTrigger(watchTrigger + 1));
    }
  }, [map]);

  const onClick = () => {
    if (geolocate) {
      geolocate.trigger();
    }
  };

  if (geolocationStatus === "declined") {
    return null;
  }

  return (
    <Button
      className="group w-12 h-12 relative bg-white border border-gray-200 text-gray-800 shadow flex flex-col justify-center transition-all duration-100 ease-in-out cursor-pointer rounded-full hover:border-orange-300"
      onClick={() => {
        onClick();
      }}
    >
      {geolocationStatus === "loading" && <PuffLoader color={theme.colors.orange[500]} size={24} />}

      {geolocationStatus !== "loading" && (
        <TargetIcon
          className={classNames(
            "w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-all duration-100 ease-in-out",
            {
              "text-gray-700": geolocationStatus === "inactive",
              "text-orange-600": geolocationStatus === "active",
            }
          )}
        />
      )}
    </Button>
  );
};
