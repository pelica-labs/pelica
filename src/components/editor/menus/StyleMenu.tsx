import React from "react";

import { StyleSelector } from "~/components/editor/controls/StyleSelector";
import { app, useStore } from "~/core/app";

export const StyleMenu: React.FC = () => {
  const style = useStore((store) => store.editor.style);

  return (
    <div className="mb-2 md:mb-0">
      <StyleSelector
        value={style}
        onChange={(style) => {
          app.editor.setStyle(style);
        }}
      />
    </div>
  );
};
