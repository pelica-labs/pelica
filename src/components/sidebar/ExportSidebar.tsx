import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BounceLoader from "react-spinners/BounceLoader";
import uniqid from "uniqid";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { CopyIcon } from "~/components/Icon";
import { SidebarHeader, SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { app, useStore } from "~/core/app";
import { getMapTitle } from "~/core/selectors";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { aspectRatios } from "~/lib/aspectRatio";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { theme } from "~/styles/tailwind";

export const ExportSidebar: React.FC = () => {
  const { t } = useTranslation();
  const [imageId, setImageId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copying, setCopying] = useState(false);
  const imageData = useStore((store) => store.exports.imageData);
  const aspectRatio = useStore((store) => store.editor.aspectRatio);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const { ratio } = aspectRatios[aspectRatio];

  const { shareFeature } = useBrowserFeatures();

  const onDownload = () => {
    app.exports.prepareCanvas();
    setDownloading(true);
  };

  const onShare = () => {
    app.exports.prepareCanvas();
    setSharing(true);
  };

  const onCopy = () => {
    app.exports.prepareCanvas();
    setCopying(true);
  };

  useEffect(() => {
    if (!imageData) {
      return;
    }

    if (downloading) {
      setDownloading(false);

      app.exports.download(
        imageData,
        [t("pelica"), getMapTitle(), format(Date.now(), "yyyy-MM-dd HH-mm-ss")].filter((text) => !!text).join(" · ")
      );
    }
  });

  useEffect(() => {
    if (!imageId) {
      return;
    }

    const url = `${window.location.host}/map/${imageId}`;

    if (sharing) {
      setSharing(false);

      navigator.share({
        title: [t("pelica"), getMapTitle()].filter((text) => !!text).join(" · "),
        url,
      });
    }

    if (copying) {
      navigator.clipboard.writeText(url).then(() => {
        setCopying(false);

        app.alerts.trigger({
          color: "green",
          icon: CopyIcon,
          message: "Map URL has been copied to clipboard.",
        });
      });
    }
  }, [imageId]);

  useEffect(() => {
    if (!imageData) {
      return;
    }

    const timeout = setTimeout(() => {
      const data = new FormData();

      data.append("image", dataUrlToBlob(imageData));

      const imageId = uniqid();
      data.append("id", imageId);

      setImageId(imageId);

      const mapTitle = getMapTitle();
      if (mapTitle) {
        data.append("name", mapTitle);
      }

      fetch("/api/upload-map", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: data,
      }).catch((error) => {
        // @todo: handle error
        console.error(error);
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [imageData]);

  return (
    <>
      <div className="flex md:flex-col md:divide-y md:divide-x-0 divide-x md:h-full">
        <SidebarSection className="flex flex-col space-y-1 md:space-y-2 w-48 md:w-auto">
          <AspectRatioSelector
            value={aspectRatio}
            onChange={(aspectRatio) => {
              app.editor.setAspectRatio(aspectRatio);
            }}
          />
        </SidebarSection>

        <SidebarSection className="flex flex-col space-y-3 w-40 md:w-auto">
          {!screenDimensions.md && (
            <SidebarHeader>
              <SidebarHeading>Export</SidebarHeading>
            </SidebarHeader>
          )}

          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center w-full"
            disabled={downloading}
            onClick={() => {
              onDownload();
            }}
          >
            Download
            {downloading && (
              <div className="ml-4">
                <BounceLoader color={theme.colors.orange[500]} size={10} />
              </div>
            )}
          </Button>

          {shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center w-full"
              disabled={sharing}
              onClick={() => {
                onShare();
              }}
            >
              Share
              {sharing && (
                <div className="ml-4">
                  <BounceLoader color={theme.colors.orange[500]} size={10} />
                </div>
              )}
            </Button>
          )}
          {!shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center w-full"
              disabled={copying}
              onClick={() => {
                onCopy();
              }}
            >
              Copy URL
              {copying && (
                <div className="ml-4">
                  <BounceLoader color={theme.colors.orange[500]} size={10} />
                </div>
              )}
            </Button>
          )}
        </SidebarSection>

        <SidebarSection className="flex flex-col space-y-3 w-64 md:w-auto">
          <SidebarHeader>
            <SidebarHeading>Output format</SidebarHeading>
          </SidebarHeader>
          <div className="flex-col md:space-y-1">
            <div className="text-xs flex justify-between">
              <span className="flex-1 mr-4">Format</span>
              <span>JPEG</span>
            </div>
            {ratio && (
              <>
                <div className="text-xs flex justify-between">
                  <span className="flex-1 mr-4">Resolution</span>
                  <span>
                    {ratio[0].toFixed(0)} <span className="text-gray-500">×</span> {ratio[1].toFixed(0)}{" "}
                    <span className="text-gray-500">px</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </SidebarSection>

        <div className="md:mt-auto px-3 md:pt-3 md:pb-2 w-64 md:w-auto">
          <SidebarHeader>
            <SidebarHeading>Copyright</SidebarHeading>
          </SidebarHeader>

          <div className="flex justify-between items-center mt-2 overflow-x-hidden">
            <span className="text-2xs leading-tight">
              Prints use map data and styles from Mapbox and OpenStreetMap and must be attributed accordingly. To learn
              more, see{" "}
              <a className="underline" href="https://docs.mapbox.com/help/how-mapbox-works/attribution/">
                Mapbox
              </a>{" "}
              and{" "}
              <a className="underline" href="http://www.openstreetmap.org/copyright">
                OSM
              </a>{" "}
              attribution requirements.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
