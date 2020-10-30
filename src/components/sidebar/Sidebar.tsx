import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";

import { MiniToolbar } from "~/components/MiniToolbar";
import { DrawSidebar } from "~/components/sidebar/DrawSidebar";
import { ExportSidebar } from "~/components/sidebar/ExportSidebar";
import { ItinerarySidebar } from "~/components/sidebar/ItinerarySidebar";
import { MoveSidebar } from "~/components/sidebar/MoveSidebar";
import { PinSidebar } from "~/components/sidebar/PinSidebar";
import { SelectSidebar } from "~/components/sidebar/SelectSidebar";
import { StyleSidebar } from "~/components/sidebar/StyleSidebar";
import { TextSidebar } from "~/components/sidebar/TextSidebar";
import { Toolbar } from "~/components/Toolbar";
import { useStore } from "~/core/app";
import { useDimensions } from "~/hooks/useDimensions";
import { Style } from "~/lib/style";

type Props = {
  initialStyles: Style[];
};

export const Sidebar: React.FC<Props> = ({ initialStyles }) => {
  const [showToolbar, setShowToolbar] = useState(true);
  const editorMode = useStore((store) => store.editor.mode);
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
          className="fixed z-10 bottom-0 md:bottom-auto md:top-0 flex justify-between md:flex-col bg-orange-50 border border-orange-200 md:bg-white md:border-gray-100 md:m-2 p-1 md:shadow md:rounded overflow-x-auto"
          style={{
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
            bottom: sidebarDimensions?.height + 13,
            transform: `translateX(${editorMode === "move" ? "-200px" : "0"})`,
          }}
        >
          <MiniToolbar />
        </div>
      )}

      <div
        ref={sidebarRef}
        className={classNames({
          "flex md:pt-0 md:pb-0 divide-x md:flex-col md:space-x-0 md:divide-y border md:border-none h-40 bg-white text-gray-800 md:w-48 xl:w-64 md:h-full overflow-y-auto md:shadow-md min-w-full pt-3": true,
        })}
        style={{
          ...(!screenDimensions.md && {
            marginBottom: !showToolbar ? 0 : -100,
          }),
        }}
      >
        {screenDimensions.md && editorMode && (
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-100 border-l">
            <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">
              <Trans i18nKey={`editor.mode.${editorMode}`} />
            </span>
          </div>
        )}

        <div className="flex divide-x md:flex-col md:space-x-0 md:divide-y  bg-white text-gray-800 md:w-48 xl:w-64 md:h-full overflow-y-auto md:shadow-md">
          {editorMode === "move" && <MoveSidebar />}
          {editorMode === "select" && <SelectSidebar />}
          {editorMode === "draw" && <DrawSidebar />}
          {editorMode === "pin" && <PinSidebar />}
          {editorMode === "text" && <TextSidebar />}
          {editorMode === "itinerary" && <ItinerarySidebar />}
          {editorMode === "style" && <StyleSidebar initialStyles={initialStyles} />}
          {editorMode === "export" && <ExportSidebar />}
        </div>
      </div>
    </div>
  );
};

export const SidebarHeading: React.FC = ({ children }) => {
  return (
    <span className="text-sm md:text-xs uppercase text-gray-800 font-light tracking-wide leading-none transition-all duration-75 ease-in-out">
      {children}
    </span>
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
