import classNames from "classnames";
import React, { useEffect, useState } from "react";

import { CloudCheck, CloudUpload } from "~/components/Icon";
import { useStore } from "~/core/app";

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
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [syncing]);

  return (
    <div className="relative flex items-center">
      <CloudUpload
        className={classNames({
          "absolute w-4 h-4 text-orange-400 transition-opacity duration-300": true,
          "opacity-100": justSynced && syncing,
          "opacity-0": !(justSynced && syncing),
        })}
      />

      <CloudCheck
        className={classNames({
          "absolute w-4 h-4 text-blue-400 transition-opacity duration-300": true,
          "opacity-100": justSynced && !syncing,
          "opacity-0": !(justSynced && !syncing),
        })}
      />
    </div>
  );
};
