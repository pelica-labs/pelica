import React, { useEffect } from "react";
import { SketchPicker as ColorPicker } from "react-color";

import { Button } from "~/components/Button";
import {
  EraserIcon,
  FireIcon,
  HandIcon,
  LineWidthIcon,
  PaintIcon,
  RulerCompassIcon,
  ShareIcon,
} from "~/components/Icon";
import { StrokeWidthPicker } from "~/components/StrokeWidthPicker";
import { StyleSelector } from "~/components/StyleSelector";
import { useStore } from "~/lib/state";

export const Toolbar: React.FC = () => {
  const editor = useStore((store) => store.editor);
  const togglePane = useStore((store) => store.togglePane);
  const setStrokeColor = useStore((store) => store.setStrokeColor);
  const clearRoutes = useStore((store) => store.clearRoutes);
  const setEditorMode = useStore((store) => store.setEditorMode);

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
            active={editor.pane === "styles"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => togglePane("styles")}
          >
            <FireIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Styles</span>
          </Button>
        </div>

        <div className="relative mt-2">
          <Button
            active={editor.pane === "colors"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => togglePane("colors")}
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: editor.strokeColor }}
            />
            <span className="ml-2 text-sm">Color</span>
          </Button>
        </div>

        <div className="relative mt-2">
          <Button
            active={editor.pane === "strokeWidth"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => togglePane("strokeWidth")}
          >
            <LineWidthIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Width</span>
          </Button>
        </div>

        <Button
          active={editor.mode === "moving"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => setEditorMode("moving")}
        >
          <HandIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Move</span>
        </Button>

        <Button
          active={editor.mode === "painting"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => setEditorMode("painting")}
        >
          <PaintIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Free drawing</span>
        </Button>

        <Button
          active={editor.mode === "drawing"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => setEditorMode("drawing")}
        >
          <RulerCompassIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Trace</span>
        </Button>

        <Button className="bg-gray-900 text-gray-200 mt-2" onClick={() => clearRoutes()}>
          <EraserIcon className="w-4 h-4" />
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

      {!!editor.pane && (
        <div className="mr-2 overflow-y-auto rounded" style={{ maxHeight: "calc(100vh - 1rem)" }}>
          {editor.pane === "styles" && <StyleSelector />}

          {editor.pane === "colors" && (
            <ColorPicker
              color={editor.strokeColor}
              styles={{ default: { picker: { backgroundColor: "rgba(26, 32, 44)" } } }}
              onChangeComplete={(event) => {
                setStrokeColor(event.hex);
              }}
            />
          )}

          {editor.pane === "strokeWidth" && <StrokeWidthPicker />}
        </div>
      )}
    </div>
  );
};
