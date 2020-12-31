import mapboxgl from "mapbox-gl";
import React from "react";
import ReactDOMServer from "react-dom/server";

export const applyWatermark = (map: mapboxgl.Map): void => {
  const watermark = ReactDOMServer.renderToString(
    <a
      className="absolute bottom-0 left-0 flex mb-1 ml-2"
      href="https://pelica.co"
      id="watermark"
      rel="noreferrer"
      target="_blank"
    >
      <img alt="Watermark" className="w-24 object-contain object-bottom" src="/images/watermark.png" />
    </a>
  );
  const container = document.createElement("div");
  container.innerHTML = watermark;

  map.getContainer().appendChild(container);
};
