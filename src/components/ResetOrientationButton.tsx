import React from "react";

import { Button } from "~/components/Button";
import { CompassIcon } from "~/components/Icon";
import { useStore } from "~/lib/state";

export const ResetOrientationButton: React.FC = () => {
  const bearing = useStore((store) => store.bearing);
  const pitch = useStore((store) => store.pitch);
  const dispatch = useStore((store) => store.dispatch);

  const showControls = bearing || pitch;

  if (!showControls) {
    return null;
  }

  return (
    <Button
      color="none"
      shadow={false}
      onClick={() => {
        dispatch.resetOrientation();
      }}
    >
      <CompassIcon className="w-5 h-5 text-gray-900" />
    </Button>
  );
};
