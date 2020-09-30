import React, { useEffect } from "react";
import { SketchPicker as ColorPicker } from "react-color";

import { Button } from "~/components/Button";
import { FireIcon, HandIcon, KabaddiIcon, LineWidthIcon, PaintIcon, PencilIcon, ShareIcon } from "~/components/Icon";
import { useMap } from "~/components/MapContext";
import { StrokeWidthPicker } from "~/components/StrokeWidthPicker";
import { StyleSelector } from "~/components/StyleSelector";

export const Toolbar: React.FC = () => {
  const { state, setColor, togglePane, setEditorMode, clearRoutes: clearMarkers } = useMap();

  const onExport = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const image = new Image();
    image.src = canvas.toDataURL();

    const newTab = window.open("", "_blank");
    newTab?.document.write(image.outerHTML);
    newTab?.focus();
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
            active={state.editor.pane === "styles"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => togglePane("styles")}
          >
            <FireIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Styles</span>
          </Button>
        </div>

        <div className="relative mt-2">
          <Button
            active={state.editor.pane === "colors"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => togglePane("colors")}
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: state.editor.color }}
            />
            <span className="ml-2 text-sm">Color</span>
          </Button>
        </div>

        <div className="relative mt-2">
          <Button
            active={state.editor.pane === "strokeWidth"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => togglePane("strokeWidth")}
          >
            <LineWidthIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Width</span>
          </Button>
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

      {!!state.editor.pane && (
        <div className="mr-2 overflow-y-auto rounded" style={{ maxHeight: "calc(100vh - 1rem)" }}>
          {state.editor.pane === "styles" && <StyleSelector />}

          {state.editor.pane === "colors" && (
            <ColorPicker
              color={state.editor.color}
              styles={{ default: { picker: { backgroundColor: "rgba(26, 32, 44)" } } }}
              onChange={(event) => setColor(event.hex)}
            />
          )}

          {state.editor.pane === "strokeWidth" && <StrokeWidthPicker />}
        </div>
      )}
    </div>
  );
};
