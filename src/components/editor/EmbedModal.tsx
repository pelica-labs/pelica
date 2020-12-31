import React, { useState } from "react";
import Modal from "react-modal";
import { BounceLoader } from "react-spinners";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/Button";
import { CloseIcon, CopyIcon } from "~/components/ui/Icon";
import { IconButton } from "~/components/ui/IconButton";
import { useStore } from "~/core/app";
import { theme } from "~/styles/tailwind";

const MAX_PREVIEW_WIDTH = 1024;

type Props = Modal.Props;

export const EmbedModal: React.FC<Props> = (props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [width, setWidth] = useState(750);
  const [height, setHeight] = useState(500);
  const [debouncedWidth] = useDebounce(width, 1000);
  const [debouncedHeight] = useDebounce(height, 1000);
  const embedUrl = useStore((store) => {
    return `${window.location.origin}/embed/${store.sync.id}`;
  });

  const embedCode = `<iframe width="%width%" height="%height%" src="${embedUrl}" frameborder="0"></iframe>`;
  const liveEmbedCode = embedCode.replace("%width%", `${width}`).replace("%height%", `${height}`);
  const debouncedEmbedCode = embedCode
    .replace("%width%", `${debouncedWidth}`)
    .replace("%height%", `${debouncedHeight}`);

  const onCopy = async () => {
    await navigator.clipboard.writeText(liveEmbedCode);

    setIsCopied(true);
  };

  return (
    <Modal {...props} style={{ content: { width: MAX_PREVIEW_WIDTH } }}>
      <IconButton
        className="absolute top-0 right-0 m-px"
        onClick={(event) => {
          props.onRequestClose?.(event);
        }}
      >
        <CloseIcon className="w-4 h-4" />
      </IconButton>

      <div className="flex flex-wrap text-sm md:text-xs gap-4">
        <div className="flex-1 relative" style={{ height }}>
          <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4">
            <BounceLoader color={theme.colors.orange[500]} size={40} />
            <span className="text-lg">Loading preview</span>
          </div>

          <div
            className="w-full h-full flex justify-center items-center absolute overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: debouncedEmbedCode }}
            style={{ maxWidth: MAX_PREVIEW_WIDTH }}
          />
        </div>

        <div className="flex flex-col space-y-2 w-56 h-full">
          <h2 className="text-lg font-medium">Embed Map</h2>

          <div className="flex items-center space-x-1">
            <span className="text-gray-500 mr-auto">Size</span>
            <input
              className="px-1 rounded shadow w-12 appearance-none"
              min={200}
              type="number"
              value={width}
              onChange={(event) => {
                setWidth(+event.target.value);
              }}
            />
            <span className="text-gray-500">×</span>
            <input
              className="px-1 rounded shadow w-12 appearance-none"
              type="number"
              value={height}
              onChange={(event) => {
                setHeight(+event.target.value);
              }}
            />
          </div>

          <textarea
            readOnly
            className="mt-auto font-mono p-2 h-64 resize-none rounded bg-gray-900 text-gray-200"
            value={liveEmbedCode}
          />

          <Button
            active={isCopied}
            className="justify-center space-x-2"
            onClick={() => {
              onCopy();
            }}
          >
            <CopyIcon className="w-4 h-4" />
            {isCopied && <span>Copied to clipboard</span>}
            {!isCopied && <span>Copy code</span>}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
