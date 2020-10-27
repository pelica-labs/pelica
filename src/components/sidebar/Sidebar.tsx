import classNames from "classnames";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";

import { ChevronDownIcon, ChevronLeftIcon } from "~/components/Icon";
import { DrawSidebar } from "~/components/sidebar/DrawSidebar";
import { ExportSidebar } from "~/components/sidebar/ExportSidebar";
import { ItinerarySidebar } from "~/components/sidebar/ItinerarySidebar";
import { PinSidebar } from "~/components/sidebar/PinSidebar";
import { SelectSidebar } from "~/components/sidebar/SelectSidebar";
import { StyleSidebar } from "~/components/sidebar/StyleSidebar";
import { TextSidebar } from "~/components/sidebar/TextSidebar";
import { Toolbar } from "~/components/Toolbar";
import { app, useStore } from "~/core/app";
import { getSelectedEntity } from "~/core/selectors";
import { useDimensions } from "~/hooks/useDimensions";
import { Style } from "~/lib/style";
import { theme } from "~/styles/tailwind";

type Props = {
  initialStyles: Style[];
};

const SidebarContext = createContext({ expanded: true });

export const Sidebar: React.FC<Props> = ({ initialStyles }) => {
  const [showToolbar, setShowToolbar] = useState(true);
  const [expandSidebar, setExpandSidebar] = useState(false);
  const editorMode = useStore((store) => store.editor.mode);
  const screenDimensions = useStore((store) => store.platform.screen.dimensions);
  const selectedEntity = useStore((store) => getSelectedEntity(store));
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDimensions = useDimensions(sidebarRef);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sidebarRef.current?.scrollTo({ left: 0 });
    toolbarRef.current?.scrollTo({ left: 0 });

    if (screenDimensions.md) {
      return;
    }

    const expandSidebar = editorMode && editorMode !== "move" && (editorMode !== "select" || selectedEntity);

    if (expandSidebar) {
      setExpandSidebar(true);
      setShowToolbar(false);
    }

    if (!expandSidebar) {
      setExpandSidebar(false);
      setShowToolbar(true);
    }
  }, [editorMode, selectedEntity]);

  useEffect(() => {
    if (screenDimensions.md) {
      setExpandSidebar(true);
      setShowToolbar(true);
    } else {
      setExpandSidebar(false);
    }
  }, [screenDimensions.md]);

  const allowSidebarExpansions =
    editorMode !== "export" && editorMode !== "move" && (editorMode !== "select" || selectedEntity);

  return (
    <div className="relative flex items-end">
      {sidebarDimensions && (
        <div
          ref={toolbarRef}
          className="fixed z-10 bottom-0 md:bottom-auto md:top-0 flex justify-between md:flex-col bg-white border md:m-2 p-1 md:shadow md:rounded overflow-x-auto transition-all duration-150 ease-in-out"
          style={{
            right: screenDimensions.md ? sidebarDimensions.width : 0,
            left: screenDimensions.md ? "initial" : 0,
            transform: !screenDimensions.md && !showToolbar ? "translateY(100px)" : "initial",
          }}
        >
          <Toolbar />
        </div>
      )}

      <div
        ref={sidebarRef}
        className={classNames({
          "flex md:pt-0 md:pb-0 divide-x md:flex-col md:space-x-0 md:divide-y border md:border-none h-40 bg-white text-gray-800 md:w-48 xl:w-64 md:h-full overflow-y-auto md:shadow-md transition-all duration-150 ease-in-out min-w-full": true,
          "pt-3": expandSidebar,
        })}
        style={{
          ...(!screenDimensions.md && {
            marginBottom: expandSidebar ? 0 : -94,
          }),
        }}
        onClick={() => {
          setExpandSidebar(true);
        }}
      >
        {screenDimensions.md && editorMode && (
          <div className="flex justify-between items-center px-3 h-8 py-2 bg-gray-100 border-l">
            <span className="text-xs uppercase text-gray-800 font-light tracking-wide leading-none">
              <Trans i18nKey={`editor.mode.${editorMode}`} />
            </span>
          </div>
        )}

        {!screenDimensions.md && (
          <div
            className={classNames({
              "flex flex-col mx-3 items-center justify-between mb-3": true,
              "mt-4": !expandSidebar,
              "mt-0": expandSidebar,
            })}
          >
            <button
              className="text-gray-800 h-8 focus:outline-none"
              onClick={(event) => {
                event.stopPropagation();
                setShowToolbar(true);
                setExpandSidebar(false);
                app.editor.setEditorMode("move");
              }}
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>

            {allowSidebarExpansions && expandSidebar && (
              <button
                className="text-gray-500 h-8 focus:outline-none"
                onClick={(event) => {
                  event.stopPropagation();
                  setExpandSidebar(!expandSidebar);
                }}
              >
                <ChevronDownIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        <SidebarContext.Provider value={{ expanded: expandSidebar }}>
          <div className="flex divide-x md:flex-col md:space-x-0 md:divide-y  bg-white text-gray-800 md:w-48 xl:w-64 md:h-full overflow-y-auto md:shadow-md">
            {editorMode === "style" && <StyleSidebar initialStyles={initialStyles} />}
            {editorMode === "select" && <SelectSidebar />}
            {editorMode === "pin" && <PinSidebar />}
            {editorMode === "text" && <TextSidebar />}
            {editorMode === "draw" && <DrawSidebar />}
            {editorMode === "itinerary" && <ItinerarySidebar />}
            {editorMode === "export" && <ExportSidebar />}
          </div>
        </SidebarContext.Provider>
      </div>
    </div>
  );
};

export const SidebarHeading: React.FC = ({ children }) => {
  const { expanded } = useContext(SidebarContext);

  return (
    <span
      className={classNames({
        "text-sm md:text-xs uppercase text-gray-800 font-light tracking-wide leading-none transition-all duration-75 ease-in-out": true,
        "text-base": !expanded,
      })}
    >
      {children}
    </span>
  );
};

export const SidebarHeader: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  const { expanded } = useContext(SidebarContext);

  return (
    <div
      className={classNames({
        "flex items-center": true,
        [`${props.className}`]: !!props.className,
        "mb-4 mt-6": !expanded,
      })}
    >
      {props.children}
    </div>
  );
};

export const SidebarSection: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  const { expanded } = useContext(SidebarContext);

  return (
    <div
      className={classNames({
        "flex flex-col px-3 md:py-4": true,
        [`${props.className}`]: !!props.className,
        "items-start": expanded,
        "w-32 overflow-hidden items-center hover:bg-orange-50 cursor-pointer md:cursor-default": !expanded,
      })}
      style={{
        ...(!expanded && {
          minWidth: theme.width[32],
        }),
      }}
    >
      {props.children}
    </div>
  );
};
