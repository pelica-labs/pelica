import React from "react";

import { StyleSelector } from "~/components/StyleSelector";
import { app, useStore } from "~/core/app";

export const StyleSidebar: React.FC = () => {
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
