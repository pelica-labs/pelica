import React, { useRef } from "react";

import { useHotkey } from "~/hooks/useHotkey";

type Props = {
  watch?: HTMLElement;
  onCopy: () => void;
  onCut: () => void;
  onPaste: (value: string) => void;
};

export const Clipboard: React.FC<Props> = ({ watch, onCopy, onCut, onPaste }) => {
  const textarea = useRef<HTMLTextAreaElement>(null);

  useHotkey({ key: "c", meta: true }, () => {
    onCopy();
  });

  useHotkey({ key: "x", meta: true }, () => {
    onCut();
  });

  useHotkey({ key: "v", meta: true }, () => {
    if (document.activeElement !== watch) {
      console.log("No");
      return;
    }

    textarea.current?.select();

    setTimeout(() => {
      if (textarea.current) {
        onPaste(textarea.current.value);
      }

      if (watch) {
        watch.focus();
      }
    }, 50);
  });

  return <textarea ref={textarea} className="fixed" style={{ top: -1000, left: -1000 }} />;
};
