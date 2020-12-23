import { signIn, useSession } from "next-auth/client";
import React from "react";
import { useTranslation } from "react-i18next";

import { MenuSection, MenuSectionHeader } from "~/components/editor/menus/MenuSection";
import { Button } from "~/components/ui/Button";
import { BuyMeACoffeeButton } from "~/components/ui/BuyMeACoffeeButton";
import { Heading } from "~/components/ui/Heading";
import { CopyIcon } from "~/components/ui/Icon";
import { FacebookButton, GoogleButton } from "~/components/ui/SocialButtons";
import { app } from "~/core/app";
import { getMapTitle, getMapUrl } from "~/core/selectors";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { useLayout } from "~/hooks/useLayout";

export const ShareMenu: React.FC = () => {
  const { t } = useTranslation();
  const [session, loading] = useSession();
  const layout = useLayout();

  const { shareFeature } = useBrowserFeatures();

  const onShare = () => {
    navigator.share({
      title: [t("pelica"), getMapTitle()].filter((text) => !!text).join(" · "),
      url: getMapUrl(),
    });
  };

  const onCopy = () => {
    const url = getMapUrl();

    navigator.clipboard.writeText(url).then(() => {
      app.alerts.trigger({
        color: "green",
        icon: CopyIcon,
        message: "Map URL has been copied to clipboard.",
      });
    });
  };

  const onPreview = () => {
    const url = getMapUrl();

    window.open(url, "_blank")?.focus();
  };

  return (
    <>
      <div className="flex md:flex-col md:divide-y md:divide-x-0 divide-x md:h-full text-gray-800">
        <MenuSection className="flex flex-col space-y-3 w-40 md:w-auto">
          {layout.vertical && (
            <MenuSectionHeader>
              <Heading>Share</Heading>
            </MenuSectionHeader>
          )}

          <Button
            className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-300 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
            onClick={() => {
              onPreview();
            }}
          >
            Preview
          </Button>

          {shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-300 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
              onClick={() => {
                onShare();
              }}
            >
              Share
            </Button>
          )}
          {!shareFeature && (
            <Button
              className="bg-orange-100 text-gray-800 border border-orange-200 hover:border-orange-100 hover:bg-orange-200 text-xs uppercase py-2 justify-center w-full"
              onClick={() => {
                onCopy();
              }}
            >
              Copy Map URL
            </Button>
          )}
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

              <FacebookButton
                className="mt-2 w-full"
                onClick={() => {
                  signIn("facebook");
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
