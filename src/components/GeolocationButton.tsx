import React, { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";

import { Button } from "~/components/Button";
import { TargetIcon } from "~/components/Icon";
import { useApp } from "~/core/app";
import { theme } from "~/styles/tailwind";

type GeolocationStatus = "pending" | "loading" | "granted";

type Props = {
  onChange: (value: Coordinates) => void;
};

export const GeolocationButton: React.FC<Props> = ({ onChange }) => {
  const app = useApp();
  const [geolocationIsAvailable, setGeolocationAvailable] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>("pending");

  const updateGeolocationAvailability = () => {
    if (!window.navigator.geolocation) {
      setGeolocationAvailable(false);
      return;
    }

    if (!window.navigator.permissions) {
      setGeolocationStatus("pending");
      setGeolocationAvailable(true);

      return;
    }

    window.navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        setGeolocationAvailable(false);
      } else {
        setGeolocationStatus("pending");
        setGeolocationAvailable(true);
      }

      if (result.state === "granted") {
        getPosition();
      }
    });
  };

  const getPosition = () => {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationStatus("granted");
        onChange(position.coords);
        app.geolocation.updateCurrentLocation(position.coords);
      },
      () => {
        updateGeolocationAvailability();
      }
    );
  };

  const onClick = () => {
    setGeolocationStatus("loading");
    getPosition();
  };

  useEffect(() => {
    updateGeolocationAvailability();
  }, []);

  if (!geolocationIsAvailable) {
    return null;
  }

  return (
    <Button
      className="group w-12 h-12 relative bg-gray-900 border border-gray-700 hover:bg-gray-900 text-gray-200 shadow flex flex-col justify-center transition-all duration-100 ease-in-out cursor-pointer rounded-full"
      color="none"
      onClick={() => {
        onClick();
      }}
    >
      {geolocationStatus === "loading" && <PuffLoader color={theme.colors.orange[500]} size={24} />}

      {/* I can't manage to find the proper icon for this */}
      {geolocationStatus !== "loading" && <TargetIcon className="w-6 h-6 text-gray-600 group-hover:text-orange-500" />}
    </Button>
  );
};
