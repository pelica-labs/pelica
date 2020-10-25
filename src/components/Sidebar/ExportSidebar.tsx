import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BounceLoader from "react-spinners/BounceLoader";

import { AspectRatioSelector } from "~/components/AspectRatioSelector";
import { Button } from "~/components/Button";
import { CopyIcon } from "~/components/Icon";
import { SidebarHeading, SidebarSection } from "~/components/sidebar/Sidebar";
import { app, useStore } from "~/core/app";
import { getMapTitle } from "~/core/selectors";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { aspectRatios } from "~/lib/aspectRatio";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { theme } from "~/styles/tailwind";

export const ExportSidebar: React.FC = () => {
  const { t } = useTranslation();
  const imageData = useStore((store) => store.exports.imageData);
  const aspectRatio = useStore((store) => store.editor.aspectRatio);
  const { ratio } = aspectRatios[aspectRatio];

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { shareFeature } = useBrowserFeatures();

  const onDownload = () => {
    if (!imageData) {
      return;
    }
    const a = document.createElement("a");
    a.href = imageData;
    a.download = [t("pelica"), getMapTitle(), format(Date.now(), "yyyy-MM-dd HH-mm-ss")]
      .filter((text) => !!text)
      .join(" · ");
    a.click();
  };

  const onShare = () => {
    if (!imageUrl) {
      return;
    }

    navigator.share({
      title: [t("pelica"), getMapTitle()].filter((text) => !!text).join(" · "),
      url: imageUrl,
    });
  };

  const onCopy = async () => {
    if (!imageUrl) {
      return;
    }

    await navigator.clipboard.writeText(imageUrl);

    app.alerts.trigger({
      color: "green",
      icon: CopyIcon,
      message: "Map URL has been copied to clipboard.",
    });
  };

  useEffect(() => {
    app.exports.prepareCanvas();
  }, []);

  useEffect(() => {
    if (!imageData) {
      return;
    }

    setImageBlob(dataUrlToBlob(imageData));
  }, [imageData]);

  useEffect(() => {
    if (!imageBlob) {
      return;
    }

    const timeout = setTimeout(() => {
      const data = new FormData();

      data.append("image", imageBlob);

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
      })
        .then((res) => res.json())
        .then((json) => {
          setImageUrl(json.url);
        })
        .catch((error) => {
          // @todo: handle error
          console.error(error);
        });
    }, 200);

    return () => clearTimeout(timeout);
  }, [imageBlob]);

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

        <SidebarSection className="flex flex-col space-y-1 md:space-y-3 w-40 md:w-auto">
          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center"
            disabled={!imageData}
            onClick={() => {
              onDownload();
            }}
          >
            Download
            {!imageData && (
              <div className="ml-4">
                <BounceLoader color={theme.colors.orange[500]} size={10} />
              </div>
            )}
          </Button>

          {shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center"
              disabled={!imageUrl}
              onClick={() => {
                onShare();
              }}
            >
              Share
              {!imageUrl && (
                <div className="ml-4">
                  <BounceLoader color={theme.colors.orange[500]} size={10} />
                </div>
              )}
            </Button>
          )}
          {!shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 text-xs uppercase py-2 justify-center"
              disabled={!imageUrl}
              onClick={() => {
                onCopy();
              }}
            >
              Copy URL
              {!imageUrl && (
                <div className="ml-4">
                  <BounceLoader color={theme.colors.orange[500]} size={10} />
                </div>
              )}
            </Button>
          )}
        </SidebarSection>

        <SidebarSection className="flex flex-col space-y-3 w-64 md:w-auto">
          <div className="flex items-center">
            <SidebarHeading>Output format</SidebarHeading>
          </div>
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
                    {ratio[0].toFixed(0)} x {ratio[1].toFixed(0)} px
                  </span>
                </div>
              </>
            )}
          </div>
        </SidebarSection>

        <div className="md:mt-auto px-3 md:pt-3 md:pb-2 w-64 md:w-auto">
          <div className="flex items-center">
            <SidebarHeading>Copyright</SidebarHeading>
          </div>

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
