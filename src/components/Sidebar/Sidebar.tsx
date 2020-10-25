import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { Trans } from "react-i18next";

import { DrawSidebar } from "~/components/sidebar/DrawSidebar";
import { ExportSidebar } from "~/components/sidebar/ExportSidebar";
import { ItinerarySidebar } from "~/components/sidebar/ItinerarySidebar";
import { PinSidebar } from "~/components/sidebar/PinSidebar";
import { SelectSidebar } from "~/components/sidebar/SelectSidebar";
import { StyleSidebar } from "~/components/sidebar/StyleSidebar";
import { Toolbar } from "~/components/Toolbar";
import { useStore } from "~/core/app";
import { useDimensions } from "~/hooks/useDimensions";
import { Style } from "~/lib/style";

type Props = {
  initialStyles: Style[];
};

export const Sidebar: React.FC<Props> = ({ initialStyles }) => {
  const editorMode = useStore((store) => store.editor.mode);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarDimensions = useDimensions(toolbarRef);

  useEffect(() => {
    sidebarRef.current?.scrollTo({ left: 0 });
  }, [editorMode]);

  return (
    <div className="flex-grow relative flex items-end">
      {sidebarDimensions && (
        <div
          ref={toolbarRef}
          className="fixed z-10 bottom-0 md:bottom-auto md:top-0 flex justify-between md:flex-col bg-white border md:m-2 p-1 md:shadow md:rounded overflow-x-auto"
          style={{
            right: screenDimensions.md ? sidebarDimensions.width : 0,
            left: screenDimensions.md ? "initial" : 0,
          }}
        >
          <Toolbar />
        </div>
      )}

      <div
        ref={sidebarRef}
        className="flex pt-3 md:pt-0 pb-2 md:pb-0 divide-x md:flex-col md:space-x-0 md:divide-y h-24 bg-white text-gray-800 md:w-48 xl:w-64 md:h-full overflow-y-auto overflow-x-auto md:shadow-md"
        style={{
          marginBottom: screenDimensions.md ? "initial" : (toolbarDimensions?.height ?? 0) + 10,
        }}
      >
        {screenDimensions.md && (
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-100 border-l">
            <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">
              <Trans i18nKey={`editor.mode.${editorMode}`} />
            </span>
          </div>
        )}

        {editorMode === "style" && <StyleSidebar initialStyles={initialStyles} />}

        {editorMode === "select" && <SelectSidebar />}

        {editorMode === "pin" && <PinSidebar />}

        {editorMode === "draw" && <DrawSidebar />}

        {editorMode === "itinerary" && <ItinerarySidebar />}

        {editorMode === "export" && <ExportSidebar />}
      </div>
    </div>
  );
};

export const SidebarHeading: React.FC = ({ children }) => {
  return <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">{children}</span>;
};

export const SidebarSection: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return <div className={classNames("px-3 md:py-4", props.className)}>{props.children}</div>;
};
