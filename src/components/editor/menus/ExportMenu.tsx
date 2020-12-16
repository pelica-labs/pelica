import { format } from "date-fns";
import { signIn, useSession } from "next-auth/client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BounceLoader from "react-spinners/BounceLoader";

import { AspectRatioSelector } from "~/components/editor/controls/AspectRatioSelector";
import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { Button } from "~/components/ui/Button";
import { BuyMeACoffeeButton } from "~/components/ui/BuyMeACoffeeButton";
import { Heading } from "~/components/ui/Heading";
import { CopyIcon } from "~/components/ui/Icon";
import { GoogleButton } from "~/components/ui/SocialButtons";
import { app, getState, useStore } from "~/core/app";
import { aspectRatios } from "~/core/aspectRatio";
import { getMapTitle } from "~/core/selectors";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { useLayout } from "~/hooks/useLayout";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { theme } from "~/styles/tailwind";

export const ExportMenu: React.FC = () => {
  const { t } = useTranslation();
  const [session, loading] = useSession();
  const [imageId, setImageId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copying, setCopying] = useState(false);
  const imageData = useStore((store) => store.exports.imageData);
  const aspectRatio = useStore((store) => store.editor.aspectRatio);
  const layout = useLayout();
  const canvasDimensions = useStore((store) => store.map.dimensions);
  const ratio = aspectRatios[aspectRatio].ratio || [canvasDimensions.width, canvasDimensions.height];

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

  const upload = async () => {
    if (!imageData) {
      return;
    }

    const data = new FormData();

    data.append("image", dataUrlToBlob(imageData));

    const res = await fetch("/api/create-image", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mapId: getState().sync.id,
      }),
    });
    const json = await res.json();

    setImageId(json.id);

    data.append("id", json.id);
    data.append("width", `${ratio[0]}`);
    data.append("height", `${ratio[1]}`);

    const mapTitle = getMapTitle();
    if (mapTitle) {
      data.append("name", mapTitle);
    }

    await fetch("/api/upload-map", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: data,
    });
  };

  useEffect(() => {
    if (!imageData) {
      return;
    }

    if (downloading) {
      setDownloading(false);

      app.exports.downloadImage(
        imageData,
        [t("pelica"), getMapTitle(), format(Date.now(), "yyyy-MM-dd HH-mm-ss")].filter((text) => !!text).join(" · ")
      );
    }
  });

  useEffect(() => {
    if (!imageId) {
      return;
    }

    const url = `${window.location.protocol}//${window.location.host}/image/${imageId}`;

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
      upload().catch((error) => {
        console.error(error);
        // @todo: handle error
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [imageData]);

  return (
    <>
      <div className="flex md:flex-col md:divide-y md:divide-x-0 divide-x md:h-full text-gray-800">
        <MenuSection className="flex flex-col space-y-1 md:space-y-2 w-48 md:w-auto">
          <AspectRatioSelector
            value={aspectRatio}
            onChange={(aspectRatio) => {
              app.editor.setAspectRatio(aspectRatio);
            }}
          />
        </MenuSection>

        <MenuSection className="flex flex-col space-y-3 w-56 md:w-auto">
          {layout.vertical && (
            <MenuSectionHeader>
              <Heading>Export</Heading>
            </MenuSectionHeader>
          )}

          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-300 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
            disabled={downloading}
            onClick={() => {
              onDownload();
            }}
          >
            Download image
            {downloading && (
              <div className="ml-4">
                <BounceLoader color={theme.colors.orange[500]} size={10} />
              </div>
            )}
          </Button>

          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-300 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
            onClick={() => {
              const fileName = [t("pelica"), getMapTitle(), format(Date.now(), "yyyy-MM-dd HH-mm-ss")]
                .filter((text) => !!text)
                .join(" · ");

              app.exports.downloadVideo(fileName);
            }}
          >
            Download video
          </Button>

          {shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-300 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
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
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-300 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
              disabled={copying}
              onClick={() => {
                onCopy();
              }}
            >
              Copy Image URL
              {copying && (
                <div className="ml-4">
                  <BounceLoader color={theme.colors.orange[500]} size={10} />
                </div>
              )}
            </Button>
          )}
        </MenuSection>

        <MenuSection className="flex flex-col space-y-3 w-64 md:w-auto">
          <MenuSectionHeader>
            <Heading>Output format</Heading>
          </MenuSectionHeader>
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
                    {ratio[0].toFixed(0)}
                    <span className="text-gray-500 mx-px">×</span>
                    {ratio[1].toFixed(0)}
                    <span className="text-gray-500 ml-1">px</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </MenuSection>

        {!session && !loading && (
          <MenuSection>
            <MenuSectionHeader>
              <Heading>Account</Heading>
            </MenuSectionHeader>
            <div className="mt-2">
              <p className="text-xs">Create an account to access this map from anywhere.</p>

              <GoogleButton
                className="mt-2 w-full"
                onClick={() => {
                  signIn("google");
                }}
              />
            </div>
          </MenuSection>
        )}

        <MenuSection className="md:mt-auto">
          <MenuSectionHeader>
            <Heading>Support us</Heading>
          </MenuSectionHeader>
          <BuyMeACoffeeButton className="mt-2" />
        </MenuSection>

        <div className="px-3 md:pt-3 md:pb-2 w-64 md:w-auto">
          <MenuSectionHeader>
            <Heading>Copyright</Heading>
          </MenuSectionHeader>

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
