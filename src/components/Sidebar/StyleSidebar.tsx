import React from "react";

import { StyleSelector } from "~/components/StyleSelector";
import { app, useStore } from "~/core/app";
import { Style } from "~/lib/style";

type Props = {
  initialStyles: Style[];
};

export const StyleSidebar: React.FC<Props> = ({ initialStyles }) => {
  const style = useStore((store) => store.editor.style);

  return (
    <div className="mb-2 md:mb-0">
      <StyleSelector
        initialStyles={initialStyles}
        value={style}
        onChange={(style) => {
          app.editor.setStyle(style);
        }}
      />
    </div>
  );
};
