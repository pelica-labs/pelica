import React from "react";
import ReactDOMServer from "react-dom/server";

import { getMap } from "~/core/selectors";

export const applyWatermark = (): void => {
  const map = getMap();

  const watermark = ReactDOMServer.renderToString(
    <div className="absolute bottom-0 left-0 flex mb-1 ml-2" id="watermark">
      <img alt="Watermark" className="w-24 object-contain object-bottom" src="/images/watermark.png" />
    </div>
  );
  const container = document.createElement("div");
  container.innerHTML = watermark;

  map.getContainer().appendChild(container);
};
