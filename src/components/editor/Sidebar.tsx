import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";

import { MapMenu } from "~/components/editor/MapMenu";
import { MenuBar } from "~/components/editor/MenuBar";
import { ExportMenu } from "~/components/editor/menus/ExportMenu";
import { ItineraryMenu } from "~/components/editor/menus/ItineraryMenu";
import { MoveMenu } from "~/components/editor/menus/MoveMenu";
import { PinMenu } from "~/components/editor/menus/PinMenu";
import { RouteMenu } from "~/components/editor/menus/RouteMenu";
import { SelectMenu } from "~/components/editor/menus/SelectMenu";
import { ShareMenu } from "~/components/editor/menus/ShareMenu";
import { StyleMenu } from "~/components/editor/menus/StyleMenu";
import { TextMenu } from "~/components/editor/menus/TextMenu";
import { ThreeDMenu } from "~/components/editor/menus/ThreeDMenu";
import { MiniToolbar } from "~/components/editor/MiniToolbar";
import { Toolbar } from "~/components/editor/Toolbar";
import { UserMenu } from "~/components/editor/UserMenu";
import { useStore } from "~/core/app";
import { useDimensions } from "~/hooks/useDimensions";
import { useLayout } from "~/hooks/useLayout";

export const Sidebar: React.FC = () => {
  const [showToolbar, setShowToolbar] = useState(true);
  const editorMode = useStore((store) => store.editor.mode);
  const editorMenuMode = useStore((store) => store.editor.menuMode);
  const layout = useLayout();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sidebarRef.current?.scrollTo({ left: 0 });
    toolbarRef.current?.scrollTo({ left: 0 });

    if (layout.horizontal) {
      return;
    }

    setShowToolbar(editorMode === "move");
  }, [editorMode, layout.horizontal]);

  return (
    <div className="relative flex items-end">
      {sidebarDimensions && (
        <div
          ref={toolbarRef}
          className="fixed z-50 bottom-0 md:bottom-auto flex justify-between md:flex-col bg-white border border-gray-300 overflow-x-auto md:rounded md:shadow"
          style={{
            top: layout.horizontal ? 48 : "initial",
            right: layout.horizontal ? sidebarDimensions.width + 6 : 0,
            left: layout.horizontal ? "initial" : 0,
            transform: layout.vertical && !showToolbar ? "translateX(-100vw)" : "initial",
          }}
        >
          <Toolbar />
        </div>
      )}

      {layout.vertical && sidebarDimensions && (
        <>
          <div
            className={classNames({
              "absolute": true,
              "transition ease-in-out duration-75": editorMode !== "move",
            })}
            style={{
              bottom: sidebarDimensions?.height + 12,
              transform: `translateX(${editorMode === "move" ? "-200px" : "0"})`,
            }}
          >
            <MiniToolbar />
          </div>
          <div className="fixed z-10 top-0 right-0 flex bg-opacity-50 bg-gray-700 py-1 pl-1 pr-2 space-x-1 rounded-bl shadow-2xl">
            <MapMenu />
            <UserMenu />
          </div>
        </>
      )}

      <div
        ref={sidebarRef}
        className={classNames({
          "relative flex md:pt-0 md:pb-0 divide-x md:divide-x-0 md:flex-col md:space-x-0 md:divide-y border-gray-300 md:border-none h-40 bg-white text-gray-800 md:w-64 md:h-full overflow-y-auto min-w-full pt-3 z-50": true,
          "hidden": layout.vertical && editorMode === "move",
        })}
        style={{
          ...(layout.vertical && {
            marginBottom: !showToolbar ? 0 : -100,
          }),
        }}
      >
        {layout.horizontal && <MenuBar />}
        <div className="flex divide-x md:divide-x-0 md:flex-col md:space-x-0 md:divide-y bg-white text-gray-800 md:w-64 md:h-full overflow-y-auto md:shadow-md">
          {editorMenuMode === "export" && <ExportMenu />}
          {editorMenuMode === "share" && <ShareMenu />}
          {!editorMenuMode && (
            <>
              {editorMode === "move" && <MoveMenu />}
              {editorMode === "select" && <SelectMenu />}
              {editorMode === "route" && <RouteMenu />}
              {editorMode === "pin" && <PinMenu />}
              {editorMode === "text" && <TextMenu />}
              {editorMode === "itinerary" && <ItineraryMenu />}
              {editorMode === "style" && <StyleMenu />}
              {editorMode === "3d" && <ThreeDMenu />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
