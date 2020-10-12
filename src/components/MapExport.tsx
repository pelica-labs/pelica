import React, { useEffect, useState } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import { Button } from "~/components/Button";
import { useBrowserFeatures } from "~/hooks/useBrowserFeatures";
import { dataUrlToBlob } from "~/lib/fileConversion";
import { theme } from "~/styles/tailwind";

type Props = {
  image: string;
  onBack: () => void;
};

export const MapExport: React.FC<Props> = ({ image, onBack }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { shareFeature } = useBrowserFeatures();

  const onDownload = () => {
    const a = document.createElement("a");
    a.href = image;
    a.download = "pelica";
    a.click();
  };

  const onShare = () => {
    if (!imageUrl) {
      return;
    }

    navigator.share({
      title: "Pelica Map",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      files: [dataUrlToBlob(image)],
    });
  };

  useEffect(() => {
    const data = new FormData();
    data.append("image", dataUrlToBlob(image));

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
      });
  }, []);

  return (
    <div className="flex justify-center h-full bg-gray-900 py-1">
      <div className="relative h-full max-w-full shadow">
        <img className="h-full max-w-full" src={imageUrl || image} />

        {!imageUrl && (
          <div className="absolute bottom-0 mb-4 w-full flex justify-center">
            <div className="flex items-center bg-gray-900 rounded-lg shadow py-2 px-6 opacity-75">
              <span className="uppercase text-gray-400 mr-4 block w-full text-sm">Preparing export...</span>
              <BounceLoader color={theme.colors.green[500]} size={10} />
            </div>
          </div>
        )}
      </div>

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
              disabled={!imageUrl}
              onClick={() => {
                onShare();
              }}
            >
              Share
              {!imageUrl && (
                <div className="ml-4">
                  <BounceLoader color={theme.colors.green[500]} size={10} />
                </div>
              )}
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
