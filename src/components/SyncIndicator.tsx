import classNames from "classnames";
import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

import { DoubleCheckIcon } from "~/components/Icon";
import { useStore } from "~/core/app";
import { theme } from "~/styles/tailwind";

export const SyncIndicator: React.FC = () => {
  const syncing = useStore((store) => store.sync.syncing);
  const [hasSyncedOnce, setHasSyncedOnce] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    if (syncing) {
      setHasSyncedOnce(true);
      return;
    }

    if (syncing === false && hasSyncedOnce) {
      setJustSynced(true);

      const timeout = setTimeout(() => {
        setJustSynced(false);
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [syncing]);

  return (
    <div className="flex items-center">
      <div
        className={classNames({
          "absolute transition-opacity duration-300": true,
          "opacity-100": syncing,
          "opacity-0": !syncing,
        })}
      >
        <ClipLoader color={theme.colors.orange[400]} size={14} />
      </div>

      <DoubleCheckIcon
        className={classNames({
          "w-4 h-4 text-orange-400 transition-opacity duration-300": true,
          "opacity-100": justSynced && !syncing,
          "opacity-0": !(justSynced && !syncing),
        })}
      />
    </div>
  );
};
