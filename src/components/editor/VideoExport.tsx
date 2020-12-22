import { format, formatDuration } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Map } from "~/components/map/Map";
import { Button } from "~/components/ui/Button";
import { app, useStore } from "~/core/app";
import { MapModel } from "~/core/db";
import { EncodingUpdate } from "~/core/export";
import { getBackgroundMap, getMapTitle } from "~/core/selectors";

type Props = {
  map: MapModel;
};

export const VideoExport: React.FC<Props> = ({ map: mapModel }) => {
  const { t } = useTranslation();
  const map = useStore((store) => getBackgroundMap(store));
  const simd = useStore((store) => store.platform.system.simd);
  const pixelRatio = useStore((store) => store.platform.screen.pixelRatio);
  const mapDimensions = useStore((store) => store.map.dimensions);
  const [showProgress, setShowProgress] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [ellapsedTime, setElaspedTime] = useState(0);
  const [encodingStatus, setEncodingStatus] = useState<EncodingUpdate>({
    framesCount: 0,
    totalFrames: 1,
    status: "running",
  });
  const encoding = useRef(true);
  const percentProgress = Math.min(100, (encodingStatus.framesCount / encodingStatus.totalFrames) * 100);
  const timeRemaining = (ellapsedTime / percentProgress) * (100 - percentProgress);

  useEffect(() => {
    if (!startTime) {
      return;
    }

    const interval = setInterval(() => {
      setElaspedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.once("idle", () => {
      const fileName = [t("pelica"), getMapTitle(), format(Date.now(), "yyyy-MM-dd HH-mm-ss")]
        .filter((text) => !!text)
        .join(" · ");

      setStartTime(Date.now());

      app.exports.downloadVideo(fileName, (update) => {
        console.log(update);
        setEncodingStatus(update);

        return encoding.current;
      });
    });
  }, [map]);

  useEffect(() => {
    if (encodingStatus.status === "running") {
      return;
    }

    app.exports.toggleVideoExport();
  }, [encodingStatus]);

  return (
    <>
      <div
        className="fixed"
        style={{
          top: 50000,
          left: 50000,
          width: mapDimensions.width / pixelRatio,
          height: mapDimensions.height / pixelRatio,
        }}
      >
        <Map background disableInteractions readOnly map={mapModel} />
      </div>
      {startTime !== 0 && showProgress && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-l-4 border-r-4 border-orange-400 p-2 z-50 flex flex-col text-gray-900 rounded-lg shadow m-8">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-wide leading-none text-sm">Encoding video</span>
              {!simd && (
                <span className="text-xs text-gray-400">
                  (
                  <a className="underline" href="#">
                    Enable SIMD
                  </a>{" "}
                  for faster performances)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="text-sm"
                onClick={() => {
                  setShowProgress(false);
                }}
              >
                Hide
              </Button>
              <Button
                className="text-sm"
                onClick={() => {
                  encoding.current = false;
                }}
              >
                Cancel export
              </Button>
            </div>
          </div>

          <div className="w-full px-1 mt-4">
            <div className="mt-1 relative bg-gray-900 rounded h-2 shadow border border-orange-500">
              <div className="absolute h-full bg-orange-400 rounded" style={{ width: `${percentProgress}%` }} />
            </div>
            <div className="mt-1 flex justify-between w-full text-xs">
              <span>
                {encodingStatus.framesCount} / ~{encodingStatus.totalFrames} frames encoded
              </span>
              <span>{percentProgress.toFixed(2)}%</span>
              {timeRemaining > 0 && (
                <span>
                  ~{formatDuration({ seconds: Math.round(timeRemaining / 1000) }, { format: ["minutes", "seconds"] })}{" "}
                  left
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
