import React from "react";

import { Button } from "~/components/Button";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";

type Props = {
  image: string;
  onBack: () => void;
};

export const MapImage: React.FC<Props> = ({ image, onBack }) => {
  const { shareFeature } = useBrowserFeatures();

  const onDownload = () => {
    const a = document.createElement("a");
    a.href = image;
    a.download = "pelica";
    a.click();
  };

  const onShare = () => {
    navigator.share({
      title: "Pelica Map",
      url: image,
    });
  };

  return (
    <div className="flex justify-center h-full bg-gray-900 py-1">
      <img className="h-full shadow" src={image} />
      <div className="flex flex-col fixed top-0 right-0 m-1 bg-gray-800 p-2 rounded border border-green-700 shadow">
        <img src="/images/logo.png" />

        <Button
          className="border border-gray-200 text-gray-200 text-xs uppercase justify-center mt-4"
          color="gray"
          onClick={() => {
            onBack();
          }}
        >
          Back to editor
        </Button>

        <div className="mt-10 flex flex-col space-y-2">
          {shareFeature && (
            <Button
              className="bg-green-700 text-gray-200 border border-green-500 hover:border-green-800 text-xs uppercase py-2 justify-center"
              onClick={() => {
                onShare();
              }}
            >
              Share
            </Button>
          )}

          <Button
            className="bg-green-700 text-gray-200 border border-green-500 hover:border-green-800 text-xs uppercase py-2 justify-center"
            onClick={() => {
              onDownload();
            }}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
