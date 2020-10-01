import React, { useEffect, useRef } from "react";
import { SketchPicker as ColorPicker } from "react-color";

import { Button } from "~/components/Button";
import {
  CheckboxIcon,
  EmptyCheckboxIcon,
  EraserIcon,
  FireIcon,
  HandIcon,
  LineWidthIcon,
  PaintIcon,
  RulerCompassIcon,
  ShareIcon,
  UploadIcon,
} from "~/components/Icon";
import { StrokeWidthPicker } from "~/components/StrokeWidthPicker";
import { StyleSelector } from "~/components/StyleSelector";
import { useStore } from "~/lib/state";

export const Toolbar: React.FC = () => {
  const ref = useRef<HTMLInputElement>(null);
  const editor = useStore((store) => store.editor);
  const dispatch = useStore((store) => store.dispatch);

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

  const onFileUpload = (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }

    dispatch.importRoute(files[0]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.keyCode === 49) {
        event.preventDefault();
        dispatch.setEditorMode("move");
      }
      if (event.metaKey && event.keyCode === 50) {
        event.preventDefault();
        dispatch.setEditorMode("freeDraw");
      }
      if (event.metaKey && event.keyCode === 51) {
        event.preventDefault();
        dispatch.setEditorMode("trace");
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
            onClick={() => dispatch.togglePane("styles")}
          >
            <FireIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Styles</span>
          </Button>
        </div>

        <div className="relative mt-2">
          <Button
            active={editor.pane === "colors"}
            className="bg-gray-900 text-gray-200 w-full"
            onClick={() => dispatch.togglePane("colors")}
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
            onClick={() => dispatch.togglePane("strokeWidth")}
          >
            <LineWidthIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Width</span>
          </Button>
        </div>

        <Button
          active={editor.mode === "move"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => dispatch.setEditorMode("move")}
        >
          <HandIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Move</span>
        </Button>

        <Button
          active={editor.mode === "freeDraw"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => dispatch.setEditorMode("freeDraw")}
        >
          <PaintIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Free drawing</span>
        </Button>

        <Button
          active={editor.mode === "trace"}
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => dispatch.setEditorMode("trace")}
        >
          <RulerCompassIcon className="w-4 h-4" />
          <span className="ml-2 text-sm">Trace</span>
        </Button>

        <Button className="bg-gray-900 text-gray-200 mt-2" onClick={() => dispatch.clearRoutes()}>
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

        <Button
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => {
            dispatch.toggleMatchMap();
          }}
        >
          {editor.matchMap ? <CheckboxIcon className="w-4 h-4" /> : <EmptyCheckboxIcon className="w-4 h-4" />}
          <span className="ml-2 text-sm">Match map</span>
        </Button>

        <Button
          className="bg-gray-900 text-gray-200 mt-2"
          onClick={() => {
            ref.current?.click();
          }}
        >
          <UploadIcon className="w-4 h-4" />
          <input ref={ref} className="hidden" type="file" onChange={(event) => onFileUpload(event.target.files)} />
          <span className="ml-2 text-sm">Upload GPX</span>
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
                dispatch.setStrokeColor(event.hex);
              }}
            />
          )}

          {editor.pane === "strokeWidth" && <StrokeWidthPicker />}
        </div>
      )}
    </div>
  );
};
