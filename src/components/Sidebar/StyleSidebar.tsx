import React from "react";

import { StyleSelector } from "~/components/StyleSelector";
import { useApp, useStore } from "~/core/app";
import { Style } from "~/lib/style";

type Props = {
  initialStyles: Style[];
};

export const StyleSidebar: React.FC<Props> = ({ initialStyles }) => {
  const app = useApp();
  const style = useStore((store) => store.editor.style);
  const screenDimensions = useStore((store) => store.screen.dimensions);

  return (
    <div style={{ marginTop: screenDimensions.md ? 0 : -12 }}>
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
