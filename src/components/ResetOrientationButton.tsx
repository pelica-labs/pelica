import React from "react";

import { Button } from "~/components/Button";
import { CompassIcon } from "~/components/Icon";
import { app, useStore } from "~/core/app";

export const ResetOrientationButton: React.FC = () => {
  const bearing = useStore((store) => store.map.bearing);
  const pitch = useStore((store) => store.map.pitch);

  const showControls = bearing || pitch;

  if (!showControls) {
    return null;
  }

  return (
    <Button
      className="group w-12 h-12 relative bg-white border border-gray-200 text-gray-800 shadow flex flex-col justify-center transition-all duration-100 ease-in-out cursor-pointer rounded-full hover:border-orange-300"
      shadow={false}
      onClick={() => {
        app.map.resetOrientation();
      }}
    >
      <CompassIcon className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-all duration-100 ease-in-out" />
    </Button>
  );
};
