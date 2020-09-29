import React, { useEffect } from "react";

import { Button } from "~/components/Button";
import { ChevronLeftIcon, FireIcon, HandIcon, KabaddiIcon, PaintIcon, PencilIcon, ShareIcon } from "~/components/Icon";
import { useMap } from "~/components/MapContext";
import { StyleSelector } from "~/components/StyleSelector";

export const Toolbar: React.FC = () => {
  const { state, toggleStyles, setEditorMode, clearMarkers } = useMap();

  const onExport = () => {
    alert("TODO");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.keyCode === 49) {
        event.preventDefault();
        setEditorMode("moving");
      }
      if (event.metaKey && event.keyCode === 50) {
        event.preventDefault();
        setEditorMode("painting");
      }
      if (event.metaKey && event.keyCode === 51) {
        event.preventDefault();
        setEditorMode("drawing");
      }
    };

    window.addEventListener("keydown", onKeyDown, false);

    return () => {
      window.removeEventListener("keydown", onKeyDown, false);
    };
  }, []);

  return (
    <div className="flex flex-row-reverse items-start">
      <nav className="flex flex-col">
        <div className="relative">
          <Button
            active={state.editor.isShowingStyles}
            className="bg-gray-900 text-gray-200"
            onClick={() => toggleStyles()}
          >
            <FireIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Styles</span>
          </Button>
          {state.editor.isShowingStyles && (
            <div className="absolute top-0 left-0 mt-1 -ml-8 rounded-full p-1 bg-gray-900 text-gray-200">
              <ChevronLeftIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        <Button
          active={state.editor.mode === "moving"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => setEditorMode("moving")}
        >
          <HandIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Move</span>
        </Button>

        <Button
          active={state.editor.mode === "painting"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => setEditorMode("painting")}
        >
          <PaintIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Paint</span>
        </Button>

        <Button
          active={state.editor.mode === "drawing"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => setEditorMode("drawing")}
        >
          <PencilIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Draw</span>
        </Button>

        <Button className="bg-gray-900 text-gray-200 mt-2" onClick={() => clearMarkers()}>
          <KabaddiIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Clear</span>
        </Button>

        <Button
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => {
            onExport();
          }}
        >
          <ShareIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Export</span>
        </Button>
      </nav>

      {state.editor.isShowingStyles && (
        <div className="mr-10 overflow-y-auto rounded" style={{ maxHeight: "calc(100vh - 16px)" }}>
          <StyleSelector />
        </div>
      )}
    </div>
  );
};
