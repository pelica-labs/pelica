import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";

import { DownloadIcon } from "~/components/Icon";
import { MapMenu } from "~/components/MapMenu";
import { ExportMenu } from "~/components/menus/ExportMenu";
import { ItineraryMenu } from "~/components/menus/ItineraryMenu";
import { MoveMenu } from "~/components/menus/MoveMenu";
import { PinMenu } from "~/components/menus/PinMenu";
import { RouteMenu } from "~/components/menus/RouteMenu";
import { SelectMenu } from "~/components/menus/SelectMenu";
import { ShareMenu } from "~/components/menus/ShareMenu";
import { StyleMenu } from "~/components/menus/StyleMenu";
import { TextMenu } from "~/components/menus/TextMenu";
import { MiniToolbar } from "~/components/MiniToolbar";
import { SyncIndicator } from "~/components/SyncIndicator";
import { Toolbar } from "~/components/Toolbar";
import { UserMenu } from "~/components/UserMenu";
import { app, useStore } from "~/core/app";
import { useDimensions } from "~/hooks/useDimensions";

export const Sidebar: React.FC = () => {
  const [showToolbar, setShowToolbar] = useState(true);
  const editorMode = useStore((store) => store.editor.mode);
  const editorMenuMode = useStore((store) => store.editor.menuMode);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sidebarRef.current?.scrollTo({ left: 0 });
    toolbarRef.current?.scrollTo({ left: 0 });

    if (screenDimensions.md) {
      return;
    }

    setShowToolbar(editorMode === "move");
  }, [editorMode, screenDimensions.md]);

  return (
    <div className="relative flex items-end">
      {sidebarDimensions && (
        <div
          ref={toolbarRef}
          className="fixed z-10 bottom-0 md:bottom-auto flex justify-between md:flex-col bg-gray-100 border border-gray-300  overflow-x-auto rounded-tl rounded-bl shadow"
          style={{
            top: screenDimensions.md ? 73 : "initial",
            right: screenDimensions.md ? sidebarDimensions.width : 0,
            left: screenDimensions.md ? "initial" : 0,
            transform: !screenDimensions.md && !showToolbar ? "translateX(-100vw)" : "initial",
          }}
        >
          <Toolbar />
        </div>
      )}

      {!screenDimensions.md && sidebarDimensions && (
        <div
          className={classNames({
            "absolute": true,
            "transition ease-in-out duration-75": editorMode !== "move",
          })}
          style={{
            bottom: sidebarDimensions?.height + 14,
            transform: `translateX(${editorMode === "move" ? "-200px" : "0"})`,
          }}
        >
          <MiniToolbar />
        </div>
      )}

      <div
        ref={sidebarRef}
        className={classNames({
          "flex md:pt-0 md:pb-0 divide-x md:divide-x-0 md:flex-col md:space-x-0 md:divide-y border-gray-300 md:border-none h-40 bg-white text-gray-800 md:w-64 md:h-full overflow-y-auto min-w-full pt-3 z-50": true,
        })}
        style={{
          ...(!screenDimensions.md && {
            marginBottom: !showToolbar ? 0 : -100,
          }),
        }}
      >
        {screenDimensions.md && (
          <div className="flex flex-col shadow-2xl">
            <div className="relative flex justify-between items-center bg-gray-900 px-2 w-full">
              <div className="flex-1 flex items-center space-x-1 relative">
                <button
                  className={classNames({
                    "flex items-center rounded py-1 px-2 text-white border  focus:outline-none focus:border-orange-300 space-x-1 mr-px": true,
                    "bg-blue-700 hover:bg-blue-600 border-blue-600 hover:border-blue-600": !editorMenuMode,
                    "bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-600": editorMenuMode === "share",
                    "bg-orange-400 hover:bg-orange-500 border-orange-300 hover:border-orange-400":
                      editorMenuMode === "export",
                  })}
                  onClick={() => {
                    app.editor.setEditorMenuMode("export");
                  }}
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="text-xs">Export</span>
                </button>
                {editorMenuMode === "export" && (
                  <div className="fixed top-0 bottom-0 right-0 mt-10 w-64 z-50 outline-none bg-gray-900 bg-opacity-95">
                    <ExportMenu />
                  </div>
                )}

                <button
                  className={classNames({
                    "flex items-center rounded py-1 px-2 text-white border focus:outline-none": true,
                    "bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-600": editorMenuMode !== "share",
                    "bg-orange-400 hover:bg-orange-500 border-orange-300 hover:border-orange-400":
                      editorMenuMode === "share",
                  })}
                  onClick={() => {
                    app.editor.setEditorMenuMode("share");
                  }}
                >
                  <span className="text-xs">Share</span>
                </button>
                {editorMenuMode === "share" && (
                  <div className="fixed top-0 bottom-0 right-0 mt-10 w-64 z-50 outline-none bg-gray-900 bg-opacity-95">
                    <ShareMenu />
                  </div>
                )}
              </div>

              <div className="right-0 mr-4">
                <SyncIndicator />
              </div>

              <div className="flex items-center space-x-1">
                <MapMenu />
                <UserMenu />
              </div>
            </div>
          </div>
        )}

        {screenDimensions.md && editorMode && (
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-100">
            <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">
              <Trans i18nKey={`editor.mode.${editorMode}`} />
            </span>
          </div>
        )}

        <div className="flex divide-x md:divide-x-0 md:flex-col md:space-x-0 md:divide-y bg-white text-gray-800 md:w-64 md:h-full overflow-y-auto md:shadow-md">
          {editorMode === "move" && <MoveMenu />}
          {editorMode === "select" && <SelectMenu />}
          {editorMode === "draw" && <RouteMenu />}
          {editorMode === "pin" && <PinMenu />}
          {editorMode === "text" && <TextMenu />}
          {editorMode === "itinerary" && <ItineraryMenu />}
          {editorMode === "style" && <StyleMenu />}
        </div>
      </div>
    </div>
  );
};

export const SidebarHeader: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div
      className={classNames({
        "flex items-center": true,
        [`${props.className}`]: !!props.className,
      })}
    >
      {props.children}
    </div>
  );
};

export const SidebarSection: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div
      className={classNames({
        "flex flex-col px-3 md:py-4 expanded": true,
        [`${props.className}`]: !!props.className,
      })}
    >
      {props.children}
    </div>
  );
};
