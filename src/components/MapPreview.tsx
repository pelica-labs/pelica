import { Menu } from "@headlessui/react";
import classNames from "classnames";
import { formatRelative } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import BounceLoader from "react-spinners/BounceLoader";

import { CopyIcon, EditIcon, ExternalIcon, TrashIcon, VerticalDotsIcon } from "~/components/Icon";
import { IconButton } from "~/components/IconButton";
import { StylePreview } from "~/components/StylePreview";
import { MapModel } from "~/lib/db";
import { staticImage } from "~/lib/staticImages";
import { defaultStyle } from "~/lib/style";
import { theme } from "~/styles/tailwind";

type Props = {
  map: MapModel;

  onMapDeleted: () => void;
};

export const MapPreview: React.FC<Props> = ({ map, onMapDeleted }) => {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const router = useRouter();

  const url = staticImage({
    coordinates: map.coordinates || [2.3522219, 48.856614],
    zoom: map.zoom || 9,
    pitch: map.pitch || 0,
    bearing: map.bearing || 0,
    height: 500,
    width: 1000,
    style: map.style || defaultStyle,
  });

  const onDeleteMap = async () => {
    setLoadingMessage("Deleting map...");

    await fetch("/api/delete-map", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: map.id,
      }),
    });

    onMapDeleted();
    setLoadingMessage(null);
  };

  const onCloneMap = async () => {
    setLoadingMessage("Duplicating map...");

    const res = await fetch("/api/clone-map", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: map.id,
      }),
    });

    const json = await res.json();

    router.push(`/app/${json.id}`);
  };

  return (
    <div className="p-1 w-full md:w-1/2 lg:w-1/3 flex flex-col items-stretch h-64">
      <span className="group relative flex flex-col items-stretch h-full p-2 border border-gray-200 bg-white rounded hover:shadow">
        <div className="flex justify-between items-center pl-1">
          <div className="flex flex-col mr-4">
            <Link passHref href={`/app/${map.id}`}>
              <a
                className="relative flex flex-col items-stretch h-full hover:text-gray-700 border border-transparent rounded transition duration-75"
                onClick={() => {
                  setLoadingMessage("Loading map...");
                }}
              >
                <span className="truncate ">{map.name || "Untitled"}</span>
              </a>
            </Link>
            <span className="text-xs text-gray-500">Last update {formatRelative(map.updatedAt, new Date())}</span>
          </div>
          <Menu>
            {({ open }) => (
              <>
                <Menu.Button as="div" className="appearance-none lg:hidden group-hover:block">
                  <IconButton>
                    <VerticalDotsIcon className="w-4 h-4" />
                  </IconButton>
                </Menu.Button>

                {open && (
                  <Menu.Items
                    static
                    className="absolute right-0 top-0 mt-10 mr-2 z-50 bg-white border md:rounded md:shadow outline-none py-1"
                  >
                    <div className="flex flex-col w-32">
                      <Menu.Item>
                        {({ active }) => (
                          <Link passHref href={`/map/${map.id}`}>
                            <a
                              className={classNames({
                                "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-orange-200 text-sm": true,
                                "bg-orange-200": active,
                              })}
                              target="_blank"
                            >
                              <ExternalIcon className="w-4 h-4" />

                              <span>Preview</span>
                            </a>
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames({
                              "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-orange-200 text-sm": true,
                              "bg-orange-200": active,
                            })}
                            onClick={() => {
                              setLoadingMessage("Loading map...");
                              router.push(`/app/${map.id}`);
                            }}
                          >
                            <EditIcon className="w-4 h-4" />

                            <span>Edit</span>
                          </a>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames({
                              "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-orange-200 text-sm": true,
                              "bg-orange-200": active,
                            })}
                            onClick={() => {
                              onCloneMap();
                            }}
                          >
                            <CopyIcon className="w-4 h-4" />

                            <span>Duplicate</span>
                          </a>
                        )}
                      </Menu.Item>

                      <div className="border-t my-1" />

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames({
                              "flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-orange-200 text-sm": true,
                              "bg-orange-200": active,
                            })}
                            onClick={() => {
                              onDeleteMap();
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />

                            <span>Delete</span>
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                )}
              </>
            )}
          </Menu>
        </div>

        <Link passHref href={`/app/${map.id}`}>
          <a
            className="mt-2 relative flex flex-col items-stretch h-full border border-transparent rounded transition duration-75"
            onClick={() => {
              setLoadingMessage("Loading map...");
            }}
          >
            <StylePreview hash={map.style?.hash || null} src={url} />

            {loadingMessage !== null && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded flex flex-col space-y-4 items-center justify-center">
                <BounceLoader color={theme.colors.orange[500]} size={20} />
                <span className="text-gray-200 bg-gray-900 bg-opacity-50 bg-clip-padding rounded-full px-2">
                  {loadingMessage}
                </span>
              </div>
            )}
          </a>
        </Link>
      </span>
    </div>
  );
};

export const MapPreviewLoading: React.FC = () => {
  return (
    <div className="p-1 w-full md:w-1/2 lg:w-1/3 flex flex-col items-stretch h-64">
      <span className="group relative flex flex-col items-stretch h-full p-2 border border-gray-200 bg-white rounded">
        <div className="flex flex-col mr-4">
          <span className="bg-gray-200 animate-pulse w-32 h-4 rounded mb-2"></span>
          <span className="bg-gray-200 animate-pulse w-24 h-2 rounded mb-2"></span>
        </div>

        <div className="bg-gray-200 animate-pulse flex-grow flex relative justify-center items-center md:w-full rounded overflow-hidden" />
      </span>
    </div>
  );
};
