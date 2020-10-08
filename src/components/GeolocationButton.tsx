import React, { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";

import { Button } from "~/components/Button";
import { TargetIcon } from "~/components/Icon";
import { useApp } from "~/core/app";
import { theme } from "~/styles/tailwind";

type GeolocationStatus = "pending" | "loading" | "granted";

export const GeolocationButton: React.FC = () => {
  const app = useApp();
  const [geolocationIsAvailable, setGeolocationAvailable] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>("pending");

  const updateGeolocationAvailability = () => {
    if (!window.navigator.geolocation) {
      setGeolocationAvailable(false);
      return;
    }

    window.navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        setGeolocationAvailable(false);
      } else {
        setGeolocationStatus("pending");
        setGeolocationAvailable(true);
      }
    });
  };

  const onClick = () => {
    setGeolocationStatus("loading");
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationStatus("granted");
        app.mapView.move(position.coords, 16, 0, 0);
      },
      () => {
        updateGeolocationAvailability();
      }
    );
  };

  useEffect(() => {
    updateGeolocationAvailability();
  }, []);

  if (!geolocationIsAvailable) {
    return null;
  }

  return (
    <Button
      className="group w-12 h-12 relative bg-gray-900 hover:bg-gray-900 text-gray-200 shadow flex flex-col justify-center transition-all duration-100 ease-in-out cursor-pointer rounded-full"
      color="none"
      onClick={() => {
        onClick();
      }}
    >
      {geolocationStatus === "loading" && <PuffLoader color={theme.colors.green[500]} size={24} />}

      {/* I can't manage to find the proper icon for this */}
      {geolocationStatus !== "loading" && <TargetIcon className="w-6 h-6 text-gray-600 group-hover:text-green-500" />}
    </Button>
  );
};
