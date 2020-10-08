import React from "react";

import { Button } from "~/components/Button";
import { CompassIcon } from "~/components/Icon";
import { useApp, useStore } from "~/core/app";

export const ResetOrientationButton: React.FC = () => {
  const app = useApp();
  const bearing = useStore((store) => store.mapView.bearing);
  const pitch = useStore((store) => store.mapView.pitch);

  const showControls = bearing || pitch;

  if (!showControls) {
    return null;
  }

  return (
    <Button
      color="none"
      shadow={false}
      onClick={() => {
        app.mapView.resetOrientation();
      }}
    >
      <CompassIcon className="w-5 h-5 text-gray-900" />
    </Button>
  );
};
