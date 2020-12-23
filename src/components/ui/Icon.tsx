import React, { SVGAttributes } from "react";

export type IconProps = SVGAttributes<SVGElement> & {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
};

export type Icon = React.FC<IconProps>;

const icon = (path: JSX.Element, size = 24): Icon => {
  /* eslint-disable-next-line prefer-arrow/prefer-arrow-functions */
  return function Icon({ ...props }) {
    return (
      <svg {...props} viewBox={`0 0 ${size}, ${size}`} xmlns="http://www.w3.org/2000/svg">
        {path}
      </svg>
    );
  };
};

export const iconFromDangerousSvgString = (svgString: string, width: number, height: number): Icon => {
  /* eslint-disable-next-line prefer-arrow/prefer-arrow-functions */
  return function Icon({ ...props }) {
    return (
      <svg
        {...props}
        dangerouslySetInnerHTML={{ __html: svgString }}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      />
    );
  };
};

export const iconFromImgUrl = (src: string, width: number, height: number): Icon => {
  /* eslint-disable-next-line prefer-arrow/prefer-arrow-functions */
  return function Icon({ ...props }) {
    return (
      <svg {...props} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <image height="100%" width="100%" x="0" xlinkHref={src} y="0" />
      </svg>
    );
  };
};

export const KabaddiIcon = icon(
  <path
    d="M11.2 10.6c1 1 2.2 1.5 3.6 1.5l.1 2.1c-1.9 0-3.6-.7-5.1-2.1l-.7-.7l-2.3 2.4L9 15.9v6H7v-5.2l-1.3-1.2v2.2L1.5 22L.1 20.6L3.7 17l-1.2-3.5c-.2-.6.1-1.1.6-1.5l3.3-3.3c.4-.5.9-.7 1.4-.7c.5 0 .8.1 1.1.3l2.3 2.3M24 11.9h-2V8.5l-1.8-.7l.9 4.4l1 5.2l.9 4.4h-2.1l-1.8-8l-2.1 2v6h-2v-7.5l2.1-2l-.6-3c-.6.6-1.3 1.2-2.1 1.6c-.9-.1-1.8-.5-2.5-1.2c1.6-.3 2.7-1.1 3.4-2.3l1-1.6c.6-1 1.5-1.3 2.6-.8L24 7.2v4.7M11.4 4.4c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2M16.5.3c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2z"
    fill="currentColor"
  />
);

export const CloseIcon = icon(
  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
);

export const SearchIcon = icon(
  <path
    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  />
);

export const FireIcon = icon(
  <>
    <path
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </>
);

export const StyleIcon = icon(
  <path
    d="M19.02 10.99V18c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h7c.55 0 1-.45 1-1s-.45-1-1-1H5.02c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2H19a2 2 0 0 0 2-2v-8.01c0-.55-.44-.99-.99-.99s-.99.44-.99.99zm-5.77-.24L12.46 9a.5.5 0 0 0-.91 0l-.79 1.75l-1.76.79a.5.5 0 0 0 0 .91l1.75.79l.79 1.76a.5.5 0 0 0 .91 0l.79-1.75l1.76-.79a.5.5 0 0 0 0-.91l-1.75-.8zm4.69-4.69l-.6-1.32c-.13-.29-.55-.29-.69 0l-.6 1.32l-1.32.6c-.29.13-.29.55 0 .69l1.32.6l.6 1.32c.13.29.55.29.69 0l.6-1.32l1.32-.6c.29-.13.29-.55 0-.69l-1.32-.6z"
    fill="currentColor"
  />,
  24
);

export const ChevronLeftIcon = icon(
  <path
    d="M16 3C8.832 3 3 8.832 3 16s5.832 13 13 13s13-5.832 13-13S23.168 3 16 3zm0 2c6.086 0 11 4.914 11 11s-4.914 11-11 11S5 22.086 5 16S9.914 5 16 5zm1.781 4.281l-6 6l-.687.719l.687.719l6 6l1.438-1.438L13.937 16l5.282-5.281z"
    fill="currentColor"
  />,
  32
);

export const ChevronRightLightIcon = icon(
  <path d="M8.593 18.157L14.25 12.5L8.593 6.843l-.707.707l4.95 4.95l-4.95 4.95l.707.707z" fill="currentColor" />,
  24
);

export const PencilIcon = icon(
  <path
    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  />
);

export const HandIcon = icon(
  <path
    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  />
);

export const PaintIcon = icon(
  <path
    d="M20.71 4.63l-1.34-1.34c-.37-.39-1.02-.39-1.41 0L9 12.25L11.75 15l8.96-8.96c.39-.39.39-1.04 0-1.41M7 14a3 3 0 0 0-3 3c0 1.31-1.16 2-2 2c.92 1.22 2.5 2 4 2a4 4 0 0 0 4-4a3 3 0 0 0-3-3z"
    fill="currentColor"
  />
);

export const ShareIcon = icon(
  <path
    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  />
);

export const LineWidthIcon = icon(
  <path d="M3 17h18v-2H3v2m0 3h18v-1H3v1m0-7h18v-3H3v3m0-9v4h18V4H3z" fill="currentColor" />
);

export const RulerCompassIcon = icon(
  <path
    d="M20 19.88V22l-1.8-1.17l-4.79-9a4.94 4.94 0 0 0 1.78-1M15 7a3 3 0 0 1-3 3a3.27 3.27 0 0 1-.44 0L5.8 20.83L4 22v-2.12L9.79 9A3 3 0 0 1 12 4V2a1 1 0 0 1 1 1v1.18A3 3 0 0 1 15 7m-2 0a1 1 0 1 0-1 1a1 1 0 0 0 1-1m-8.78 3L6 11.8l-1.44 2.76L2.1 12.1m9.9 5.66l-1.5-1.51L9 19l3 3l3-3l-1.47-2.77M19.78 10L18 11.8l1.5 2.76l2.4-2.46z"
    fill="currentColor"
  />
);

export const EraserIcon = icon(
  <path
    d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95l-4.95 4.95z"
    fill="currentColor"
  />
);

export const CheckboxIcon = icon(
  <path
    d="M19 19H5V5h10V3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8h-2m-11.09-.92L6.5 11.5L11 16L21 6l-1.41-1.42L11 13.17l-3.09-3.09z"
    fill="currentColor"
  />
);

export const EmptyCheckboxIcon = icon(
  <path
    d="M19 3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5h14z"
    fill="currentColor"
  />
);

export const UploadIcon = icon(
  <path d="M9 10v6h6v-6h4l-7-7l-7 7h4m3-4.2L14.2 8H13v6h-2V8H9.8L12 5.8M19 18H5v2h14v-2z" fill="currentColor" />
);

export const PinIcon = icon(
  <path
    d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4a2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8a4 4 0 0 1 0 8z"
    fill="currentColor"
  />,
  24
);

export const DownloadIcon = icon(
  <path d="M13 5v6h1.17L12 13.17L9.83 11H11V5h2m2-2H9v6H5l7 7l7-7h-4V3m4 15H5v2h14v-2z" fill="currentColor" />
);

export const UndoIcon = icon(
  <path
    d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
    fill="currentColor"
  />
);

export const RedoIcon = icon(
  <path
    d="M18.4 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16a8.002 8.002 0 0 1 7.6-5.5c1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"
    fill="currentColor"
  />
);

export const SizeSelectIcon = icon(
  <path
    d="M23 15h-2v2h2v-2m0-4h-2v2h2v-2m0 8h-2v2c1 0 2-1 2-2M15 3h-2v2h2V3m8 4h-2v2h2V7m-2-4v2h2c0-1-1-2-2-2M3 21h8v-6H1v4a2 2 0 0 0 2 2M3 7H1v2h2V7m12 12h-2v2h2v-2m4-16h-2v2h2V3m0 16h-2v2h2v-2M3 3C2 3 1 4 1 5h2V3m0 8H1v2h2v-2m8-8H9v2h2V3M7 3H5v2h2V3z"
    fill="currentColor"
  />
);

export const CompassIcon = icon(
  <path
    d="M15 9l-3-9l-3 9l-9 3l9 3l3 9l3-9l9-3l-9-3M4 12l6-2l1 2H4m8 8l-2-6l2-1v7m0-16l2 6l-2 1V4m2 10l-1-2h7l-6 2m-5.3 3.3L5 19l1.7-3.7l1.6.5l.4 1.5m8.6-2L19 19l-3.7-1.7l.5-1.6l1.5-.4M6.7 8.7L5 5l3.7 1.7l-.5 1.5l-1.5.5m8.6-2L19 5l-1.7 3.7l-1.6-.5l-.4-1.5z"
    fill="currentColor"
  />
);

export const PaletteIcon = icon(
  <path
    d="M12 22A10 10 0 0 1 2 12A10 10 0 0 1 12 2c5.5 0 10 4 10 9a6 6 0 0 1-6 6h-1.8c-.3 0-.5.2-.5.5c0 .1.1.2.1.3c.4.5.6 1.1.6 1.7c.1 1.4-1 2.5-2.4 2.5m0-18a8 8 0 0 0-8 8a8 8 0 0 0 8 8c.3 0 .5-.2.5-.5c0-.2-.1-.3-.1-.4c-.4-.5-.6-1-.6-1.6c0-1.4 1.1-2.5 2.5-2.5H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7m-5.5 6c.8 0 1.5.7 1.5 1.5S7.3 13 6.5 13S5 12.3 5 11.5S5.7 10 6.5 10m3-4c.8 0 1.5.7 1.5 1.5S10.3 9 9.5 9S8 8.3 8 7.5S8.7 6 9.5 6m5 0c.8 0 1.5.7 1.5 1.5S15.3 9 14.5 9S13 8.3 13 7.5S13.7 6 14.5 6m3 4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5z"
    fill="currentColor"
  />
);

export const TargetIcon = icon(
  <path
    d="M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m-8.95 5H1v-2h2.05C3.5 6.83 6.83 3.5 11 3.05V1h2v2.05c4.17.45 7.5 3.78 7.95 7.95H23v2h-2.05c-.45 4.17-3.78 7.5-7.95 7.95V23h-2v-2.05C6.83 20.5 3.5 17.17 3.05 13M12 5a7 7 0 0 0-7 7a7 7 0 0 0 7 7a7 7 0 0 0 7-7a7 7 0 0 0-7-7z"
    fill="currentColor"
  />
);

export const InformationIcon = icon(
  <path
    d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2v6z"
    fill="currentColor"
  />
);

export const ExportIcon = icon(
  <path
    d="M13 9.8v.9l-1.7.2c-2.6.4-4.5 1.4-5.9 2.7c1.7-.5 3.5-.8 5.6-.8h2v1.3l2.2-2.1L13 9.8M11 5l7 7l-7 7v-4.1c-5 0-8.5 1.6-11 5.1c1-5 4-10 11-11m6-1V5l7 7l-7 7v-3l4-4"
    fill="currentColor"
  />
);

export const ImageSizeIcon = icon(
  <path d="M7 17V1H5v4H1v2h4v10a2 2 0 0 0 2 2h10v4h2v-4h4v-2m-6-2h2V7a2 2 0 0 0-2-2H9v2h8v8z" fill="currentColor" />,
  24
);

// -- Line Awesome start

export const FacebookIcon = icon(
  <path
    d="M16 4C9.384 4 4 9.384 4 16s5.384 12 12 12s12-5.384 12-12S22.616 4 16 4zm0 2c5.535 0 10 4.465 10 10a9.977 9.977 0 0 1-8.512 9.879v-6.963h2.848l.447-2.893h-3.295v-1.58c0-1.2.395-2.267 1.518-2.267h1.805V9.652c-.317-.043-.988-.136-2.256-.136c-2.648 0-4.2 1.398-4.2 4.584v1.923h-2.722v2.893h2.722v6.938A9.975 9.975 0 0 1 6 16c0-5.535 4.465-10 10-10z"
    fill="currentColor"
  />,
  32
);

export const InstagramIcon = icon(
  <path
    d="M11.469 5C7.918 5 5 7.914 5 11.469v9.062C5 24.082 7.914 27 11.469 27h9.062C24.082 27 27 24.086 27 20.531V11.47C27 7.918 24.086 5 20.531 5zm0 2h9.062A4.463 4.463 0 0 1 25 11.469v9.062A4.463 4.463 0 0 1 20.531 25H11.47A4.463 4.463 0 0 1 7 20.531V11.47A4.463 4.463 0 0 1 11.469 7zm10.437 2.188a.902.902 0 0 0-.906.906c0 .504.402.906.906.906a.902.902 0 0 0 .907-.906a.902.902 0 0 0-.907-.906zM16 10c-3.3 0-6 2.7-6 6s2.7 6 6 6s6-2.7 6-6s-2.7-6-6-6zm0 2c2.223 0 4 1.777 4 4s-1.777 4-4 4s-4-1.777-4-4s1.777-4 4-4z"
    fill="currentColor"
  />,
  32
);

export const YouTubeIcon = icon(
  <path
    d="M16 6c-3.766 0-7.094.39-9.125.688c-1.68.246-3.035 1.511-3.344 3.187C3.27 11.301 3 13.387 3 16s.27 4.7.531 6.125c.309 1.676 1.664 2.945 3.344 3.188c2.04.296 5.379.687 9.125.687c3.746 0 7.086-.39 9.125-.688c1.68-.242 3.035-1.511 3.344-3.187c.261-1.43.531-3.52.531-6.125s-.266-4.695-.531-6.125c-.309-1.676-1.664-2.941-3.344-3.188C23.094 6.391 19.765 6 16 6zm0 2c3.633 0 6.879.371 8.844.656A1.966 1.966 0 0 1 26.5 10.25c.242 1.32.5 3.277.5 5.75c0 2.469-.258 4.43-.5 5.75a1.957 1.957 0 0 1-1.656 1.594C22.87 23.629 19.609 24 16 24c-3.61 0-6.875-.371-8.844-.656A1.962 1.962 0 0 1 5.5 21.75C5.258 20.43 5 18.477 5 16c0-2.48.258-4.43.5-5.75a1.962 1.962 0 0 1 1.656-1.594C9.117 8.371 12.367 8 16 8zm-3 2.281V21.72l1.5-.844l7-4L23 16l-1.5-.875l-7-4zm2 3.438L18.969 16L15 18.281z"
    fill="currentColor"
  />,
  32
);

export const SquareIcon = icon(<path d="M6 6v20h20V6zm2 2h16v16H8z" fill="currentColor" />);

export const FileIcon = icon(
  <path d="M6 3v26h20V9.594l-.281-.313l-6-6L19.406 3zm2 2h10v6h6v16H8zm12 1.438L22.563 9H20z" fill="currentColor" />,
  32
);

export const ExpandIcon = icon(
  <path
    d="M4 4v9h2V7.437L14.563 16L6 24.563V19H4v9h9v-2H7.437L16 17.437L24.563 26H19v2h9v-9h-2v5.563L17.437 16L26 7.437V13h2V4h-9v2h5.563L16 14.563L7.437 6H13V4z"
    fill="currentColor"
  />,
  32
);

export const RouteIcon = icon(
  <path
    d="M22.43 10.59l-9.01-9.01c-.75-.75-2.07-.76-2.83 0l-9 9c-.78.78-.78 2.04 0 2.82l9 9c.39.39.9.58 1.41.58c.51 0 1.02-.19 1.41-.58l8.99-8.99c.79-.76.8-2.02.03-2.82zm-10.42 10.4l-9-9l9-9l9 9l-9 9zM8 11v4h2v-3h4v2.5l3.5-3.5L14 7.5V10H9c-.55 0-1 .45-1 1z"
    fill="currentColor"
  />,
  24
);

export const DragHandleIcon = icon(
  <path
    d="M12 6a1.999 1.999 0 1 0 0 4a1.999 1.999 0 1 0 0-4zm8 0a1.999 1.999 0 1 0 0 4a1.999 1.999 0 1 0 0-4zm-8 8a1.999 1.999 0 1 0 0 4a1.999 1.999 0 1 0 0-4zm8 0a1.999 1.999 0 1 0 0 4a1.999 1.999 0 1 0 0-4zm-8 8a1.999 1.999 0 1 0 0 4a1.999 1.999 0 1 0 0-4zm8 0a1.999 1.999 0 1 0 0 4a1.999 1.999 0 1 0 0-4z"
    fill="currentColor"
  />,
  32
);

export const PlusIcon = icon(<path d="M15 5v10H5v2h10v10h2V17h10v-2H17V5z" fill="currentColor" />, 32);

export const MenuIcon = icon(<path d="M4 7v2h24V7zm0 8v2h24v-2zm0 8v2h24v-2z" fill="currentColor" />, 32);

export const TrashIcon = icon(
  <path
    d="M15 4c-.523 0-1.059.184-1.438.563C13.184 4.94 13 5.476 13 6v1H7v2h1v16c0 1.645 1.355 3 3 3h12c1.645 0 3-1.355 3-3V9h1V7h-6V6c0-.523-.184-1.059-.563-1.438C20.06 4.184 19.523 4 19 4zm0 2h4v1h-4zm-5 3h14v16c0 .555-.445 1-1 1H11c-.555 0-1-.445-1-1zm2 3v11h2V12zm4 0v11h2V12zm4 0v11h2V12z"
    fill="currentColor"
  />,
  32
);

export const MousePointerIcon = icon(
  <path
    d="M10.07 14.27a.997.997 0 0 1 1.33.48l2.3 4.99l1.8-.85l-2.31-4.98c-.24-.5-.02-1.1.48-1.33l.28-.08l2.3-.45L8 5.12V15.9l1.82-1.47l.25-.16m3.57 7.7a.99.99 0 0 1-1.33-.47l-2.18-4.74l-2.51 2.02c-.17.14-.38.22-.62.22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1c.24 0 .47.09.64.23l.01-.01l11.49 9.64a1.001 1.001 0 0 1-.44 1.75l-3.16.62l2.2 4.73c.26.5.02 1.09-.48 1.32l-3.62 1.69z"
    fill="currentColor"
  />,
  24
);

export const CarIcon = icon(
  <path
    d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m-11 0A1.5 1.5 0 0 1 5 14.5A1.5 1.5 0 0 1 6.5 13A1.5 1.5 0 0 1 8 14.5A1.5 1.5 0 0 1 6.5 16M18.92 6c-.2-.58-.76-1-1.42-1h-11c-.66 0-1.22.42-1.42 1L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-6z"
    fill="currentColor"
  />,
  24
);

export const WalkingIcon = icon(
  <path
    d="M14.12 10H19V8.2h-3.62l-2-3.33c-.3-.5-.84-.84-1.46-.84c-.18 0-.34.03-.5.08L6 5.8V11h1.8V7.33l2.11-.66L6 22h1.8l2.87-8.11L13 17v5h1.8v-6.41l-2.49-4.54l.73-2.87M14 3.8c1 0 1.8-.8 1.8-1.8S15 .2 14 .2S12.2 1 12.2 2S13 3.8 14 3.8z"
    fill="currentColor"
  />,
  24
);

export const BicycleIcon = icon(
  <path
    d="M5 20.5A3.5 3.5 0 0 1 1.5 17A3.5 3.5 0 0 1 5 13.5A3.5 3.5 0 0 1 8.5 17A3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m9.8-2H19V8.2h-3.2l-1.94-3.27c-.29-.5-.86-.83-1.46-.83c-.47 0-.9.19-1.2.5L7.5 8.29C7.19 8.6 7 9 7 9.5c0 .63.33 1.16.85 1.47L11.2 13v5H13v-6.5l-2.25-1.65l2.32-2.35m5.93 13a3.5 3.5 0 0 1-3.5-3.5a3.5 3.5 0 0 1 3.5-3.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m0-8.5a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m-3-7.2c1 0 1.8-.8 1.8-1.8S17 1.2 16 1.2S14.2 2 14.2 3S15 4.8 16 4.8z"
    fill="currentColor"
  />,
  24
);

export const HelicopterIcon = icon(
  <path
    d="M14.813 7.531a.95.95 0 0 0-.75.969v.063L5 8.063A.93.93 0 0 0 4.062 9A.93.93 0 0 0 5 9.938l9.063-.5v2.093A4.41 4.41 0 0 0 12.28 13H2.5c-.5 0-.619.844-.063.938c.153.025 5.561 1.345 8.75 2.124c-.057.447-.093.9-.093 1.375c0 3.525 3.079 3.532 6.875 3.532s6.843-.006 6.843-3.532c0-3.522-4.609-6.375-8.406-6.375c-.162 0-.315.022-.468.032V9.438l9.062.5A.93.93 0 0 0 25.938 9A.93.93 0 0 0 25 8.062l-9.063.5V8.5a.95.95 0 0 0-1.03-.969a.95.95 0 0 0-.095 0zM2.5 11.188a2.312 2.312 0 1 0 0 4.624c.745 0 1.39-.359 1.813-.906l-1.22-.344c-.177.1-.376.188-.593.188c-.686 0-1.25-.565-1.25-1.25s.565-1.25 1.25-1.25c.332 0 .622.13.844.344h1.281A2.293 2.293 0 0 0 2.5 11.188zm15.625 1.874c1.78 0 4.844 1.663 4.844 3.75c0 .782-.81 1.157-3.563 1.157c-1.806 0-2.312-.84-2.312-1.907c0-1.613.198-3 1.031-3zm6.688 7.97a.95.95 0 0 0-.688.593c.01-.01.035-.017-.063.031c-.277.139-1.15.407-3.062.407H10a.95.95 0 1 0 0 1.875h11c2.071 0 3.18-.233 3.906-.594c.363-.181.641-.404.813-.657c.086-.126.152-.257.187-.375c.036-.117.032-.28.032-.28a.95.95 0 0 0-1.032-1a.95.95 0 0 0-.093 0zM902 1469v2h26v-2h-26zm4 5v2h18v-2h-18zm-4 5v2h26v-2h-26zm4 5v2h18v-2h-18zm-4 5v2h26v-2h-26z"
    fill="currentColor"
  />,
  26
);

export const CopyIcon = icon(
  <path d="M5 5v17h4v-2H7V7h13v2h2V5H5zm5 5v17h17V10H10zm2 2h13v13H12V12z" fill="currentColor" />,
  32
);

export const ErrorIcon = icon(
  <path
    d="M16 4C9.383 4 4 9.383 4 16s5.383 12 12 12s12-5.383 12-12S22.617 4 16 4zm0 2c5.535 0 10 4.465 10 10s-4.465 10-10 10S6 21.535 6 16S10.465 6 16 6zm-1 4v8h2v-8zm0 10v2h2v-2z"
    fill="currentColor"
  />,
  32
);

export const DoubleCheckIcon = icon(
  <path
    d="M23.281 7.281L11.5 19.063L8.719 16.28L7.28 17.72l2.782 2.781L8 22.563L1.719 16.28L.28 17.72l7 7l.719.687l.719-.687l2.781-2.782l2.781 2.782l.719.687l.719-.687l15.906-16l-1.438-1.438L15 22.563L12.937 20.5L24.72 8.719z"
    fill="currentColor"
  />,
  32
);

export const WarningIcon = icon(
  <path
    d="M16 3.219l-.875 1.5l-12 20.781l-.844 1.5H29.72l-.844-1.5l-12-20.781zm0 4L26.25 25H5.75zM15 14v6h2v-6zm0 7v2h2v-2z"
    fill="currentColor"
  />,
  32
);

export const TentIcon = icon(
  <path
    clipRule="evenodd"
    d="M29.1644 27.1816C24.1 24.855 19.5794 13.6894 17.3725 8.26384L19.6319 4.01275C19.7082 3.87307 19.7313 3.71075 19.6968 3.55555C19.6624 3.40035 19.5728 3.26267 19.4444 3.16775C19.1856 2.99279 18.8519 3.08771 18.6944 3.37993L16.8175 6.91072C16.3956 5.90192 16.1144 5.28957 16 5.28957C15.8875 5.28957 15.6119 5.88331 15.2013 6.86605L13.3056 3.2999C13.1481 3.00768 12.8106 2.91276 12.5556 3.08771C12.4272 3.18264 12.3376 3.32032 12.3032 3.47551C12.2687 3.63071 12.2918 3.79303 12.3681 3.93272L14.6462 8.21731C12.4506 13.6131 7.93562 24.7917 2.875 27.1629V23.4535H1V29H9.74875C14.6275 25.4301 16 13.9723 16 13.9723C16 13.9723 17.7681 25.4301 22.2512 29L31 28.9944V23.4535H29.1644V27.1816Z"
    fill="currentColor"
    fillRule="evenodd"
  />,
  32
);

export const StartIcon = icon(
  <path d="M4 2v11.82l9-5.94L4 2zm1.5 2.82l4.81 3.06L5.5 11V4.82z" fill="currentColor" />,
  16
);

export const FinishIcon = icon(
  <path
    d="M5 4v24h2v-8h20V4H5zm2 2h3v3h3V6h3v3h3V6h3v3h3v3h-3v3h3v3h-3v-3h-3v3h-3v-3h-3v3h-3v-3H7v-3h3V9H7V6zm3 6v3h3v-3h-3zm3 0h3V9h-3v3zm3 0v3h3v-3h-3zm3 0h3V9h-3v3z"
    fill="currentColor"
  />,
  32
);

export const SleepIcon = icon(
  <path
    d="M23 12h-6v-2l3.39-4H17V4h6v2l-3.38 4H23v2m-8 4H9v-2l3.39-4H9V8h6v2l-3.38 4H15v2m-8 4H1v-2l3.39-4H1v-2h6v2l-3.38 4H7v2z"
    fill="currentColor"
  />,
  24
);

export const EatIcon = icon(
  <path
    d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
    fill="currentColor"
  />,
  24
);

export const DrinkIcon = icon(
  <path d="M7.5 7l-2-2h13l-2 2M11 13v6H6v2h12v-2h-5v-6l8-8V3H3v2l8 8z" fill="currentColor" />,
  24
);

export const WaterIcon = icon(
  <path d="M12 20a6 6 0 0 1-6-6c0-4 6-10.75 6-10.75S18 10 18 14a6 6 0 0 1-6 6z" fill="currentColor" />,
  24
);

export const MountainIcon = icon(
  <path
    d="M7.5 2c-.3 0-.4.2-.6.4l-5.8 9.5c-.1.1-.1.3-.1.4c0 .5.4.7.7.7h11.6c.4 0 .7-.2.7-.7c0-.2 0-.2-.1-.4L8.2 2.4C8 2.2 7.8 2 7.5 2zm0 1.5L10.8 9H10L8.5 7.5L7.5 9l-1-1.5L5 9h-.9l3.4-5.5z"
    fill="currentColor"
  />,
  15
);

export const PhotoIcon = icon(
  <path
    d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5z"
    fill="currentColor"
  />,
  24
);

export const StarIcon = icon(
  <path
    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21L12 17.27z"
    fill="currentColor"
  />,
  24
);

export const HeartIcon = icon(
  <path
    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
    fill="currentColor"
  />,
  24
);

export const ShoppingIcon = icon(
  <path
    d="M5 22h14a2 2 0 0 0 2-2V9a1 1 0 0 0-1-1h-3v-.777c0-2.609-1.903-4.945-4.5-5.198A5.005 5.005 0 0 0 7 7v1H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2zm12-12v2h-2v-2h2zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9V7zm-2 3h2v2H7v-2z"
    fill="currentColor"
  />,
  24
);

export const PlaneIcon = icon(
  <path
    d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1l3.5 1v-1.5L13 19v-5.5l8 2.5z"
    fill="currentColor"
  />,
  24
);

export const BoatIcon = icon(
  <path
    d="M20 21c-1.39 0-2.78-.47-4-1.32c-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99a8.752 8.752 0 0 0 8 0c1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2c.98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42a1.007 1.007 0 0 0-.66 1.28L3.95 19zM6 6h12v3.97L12 8L6 9.97V6z"
    fill="currentColor"
  />,
  24
);

export const HouseIcon = icon(
  <g fill="currentColor">
    <path d="M6.5 10.995V14.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .146-.354l6-6a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 .146.354v7a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V11c0-.25-.25-.5-.5-.5H7c-.25 0-.5.25-.5.495z" />
    <path d="M13 2.5V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" fillRule="evenodd" />
  </g>,
  16
);

export const WorkIcon = icon(
  <path
    d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8c0-1.11.89-2 2-2h4V4c0-1.11.89-2 2-2m4 4V4h-4v2h4z"
    fill="currentColor"
  />,
  24
);

export const SportIcon = icon(
  <path
    d="M19.52 2.49C17.18.15 12.9.62 9.97 3.55c-1.6 1.6-2.52 3.87-2.54 5.46c-.02 1.58.26 3.89-1.35 5.5l-4.24 4.24l1.42 1.42l4.24-4.24c1.61-1.61 3.92-1.33 5.5-1.35s3.86-.94 5.46-2.54c2.92-2.93 3.4-7.21 1.06-9.55zm-9.2 9.19c-1.53-1.53-1.05-4.61 1.06-6.72s5.18-2.59 6.72-1.06c1.53 1.53 1.05 4.61-1.06 6.72s-5.18 2.59-6.72 1.06zM18 17c.53 0 1.04.21 1.41.59c.78.78.78 2.05 0 2.83c-.37.37-.88.58-1.41.58s-1.04-.21-1.41-.59c-.78-.78-.78-2.05 0-2.83c.37-.37.88-.58 1.41-.58m0-2a3.998 3.998 0 0 0-2.83 6.83c.78.78 1.81 1.17 2.83 1.17a3.998 3.998 0 0 0 2.83-6.83A3.998 3.998 0 0 0 18 15z"
    fill="currentColor"
  />,
  24
);

export const TrainIcon = icon(
  <path
    d="M12 2c-4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19a3.5 3.5 0 0 0 3.5-3.5V6c0-3.5-3.58-4-8-4M7.5 17A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 14A1.5 1.5 0 0 1 9 15.5A1.5 1.5 0 0 1 7.5 17m3.5-7H6V6h5v4m2 0V6h5v4h-5m3.5 7a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5z"
    fill="currentColor"
  />,
  24
);

export const HumanIcon = icon(
  <path
    d="M5 1c0 2.7 1.56 5.16 4 6.32V22h2v-7h2v7h2V7.31C17.44 6.16 19 3.7 19 1h-2a5 5 0 0 1-5 5a5 5 0 0 1-5-5m5 0c-1.11 0-2 .89-2 2c0 1.11.89 2 2 2c1.11 0 2-.89 2-2c0-1.11-.89-2-2-2z"
    fill="currentColor"
  />,
  24
);

export const TreeIcon = icon(
  <path
    d="M11 21v-4.26c-.47.17-.97.26-1.5.26C7 17 5 15 5 12.5c0-1.27.5-2.41 1.36-3.23C6.13 8.73 6 8.13 6 7.5C6 5 8 3 10.5 3c1.56 0 2.94.8 3.75 2h.25a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5c-.5 0-1-.07-1.5-.21V21h-2z"
    fill="currentColor"
  />,
  24
);

export const MuseumIcon = icon(
  <path
    d="M9.27 19h3.916l.602 18H8.749l.521-18zM6 38h38v2h3v3h2v2H1v-2h2v-3h3v-2zm40-24.188L25.002 5L4 13.812V15h42v-1.188zM8 16h34v2H8v-2zm28.736 3h3.914l.607 18h-5.046l.525-18zm-9.152 0h3.914l.6 18h-5.041l.527-18zm-9.154 0h3.915l.596 18h-5.039l.528-18z"
    fill="currentColor"
  />,
  50
);

export const SelectorCarretIcon = icon(
  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />,
  20
);

export const ChevronUpIcon = icon(
  <path
    d="M16 3C8.832 3 3 8.832 3 16s5.832 13 13 13s13-5.832 13-13S23.168 3 16 3zm0 2c6.086 0 11 4.914 11 11s-4.914 11-11 11S5 22.086 5 16S9.914 5 16 5zm0 6.094l-.719.687l-6 6l1.438 1.438L16 13.937l5.281 5.282l1.438-1.438l-6-6z"
    fill="currentColor"
  />,
  32
);

export const ChevronDownIcon = icon(
  <path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42z" fill="currentColor" />,
  24
);

export const PeakyPinIcon = icon(
  <>
    <circle cx="18" cy="14" fill="currentColor" r="14" />
    <rect fill="currentColor" height="9" width="2" x="17" y="27" />
  </>,

  36
);

export const PelipinIcon = icon(
  <>
    <path
      clipRule="evenodd"
      d="M21 24.5085C20.9988 26.2494 20.6367 27.9732 19.9343 29.5817C19.2307 31.1928 18.1995 32.6566 16.8995 33.8897C16.0325 34.7121 15.0573 35.421 14 36C12.9427 35.421 11.9675 34.7121 11.1005 33.8897C9.80048 32.6566 8.76925 31.1928 8.06568 29.5817C7.36305 27.9727 7.00096 26.2484 7 24.5069V24.5H21C21 24.5028 21 24.5057 21 24.5085Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <ellipse cx="14" cy="13.5" fill="currentColor" rx="13.5" ry="13.5" transform="rotate(-180 14 13.5)" />
  </>,
  36
);

export const ClassicalPinIcon = icon(
  <path
    d="M14 0C6.28036 0 0 6.28036 0 14C0 17.75 2.27193 22.5657 6.75264 28.3127C8.80547 30.9389 11.0286 33.4275 13.4076 35.7623C13.5671 35.9148 13.7793 36 14 36C14.2207 36 14.4329 35.9148 14.5924 35.7623C16.9714 33.4275 19.1945 30.9389 21.2474 28.3127C25.7281 22.5657 28 17.75 28 14C28 6.28036 21.7196 0 14 0Z"
    fill="currentColor"
  />,
  36
);

export const RoundPinIcon = icon(<circle cx="14" cy="14" fill="currentColor" r="14" />, 28);

export const SquaredPelipinIcon = icon(
  <>
    <rect fill="currentColor" height="24" rx="2" width="24" />
    <path
      clipRule="evenodd"
      d="M19 24.0114C18.9985 25.8272 18.6364 27.625 17.9343 29.3026C17.2307 30.9838 16.1995 32.5113 14.8995 33.798C14.0325 34.6561 13.0573 35.3958 12 36C10.9427 35.3958 9.96749 34.6561 9.1005 33.798C7.80048 32.5113 6.76925 30.9838 6.06568 29.3026C5.36344 27.6246 5.00135 25.8264 5 24.0102L5 24H19C19 24.0038 19 24.0076 19 24.0114Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </>,
  36
);

export const SquaredClassicalPinIcon = icon(
  <>
    <rect fill="currentColor" height="24" rx="2" width="24" />
    <path
      clipRule="evenodd"
      d="M0.268738 23C1.30559 24.6043 2.61548 26.3598 4.23496 28.3127C6.42164 30.9496 8.81631 33.4275 11.3652 35.7623C11.5361 35.9148 11.7635 36 12 36C12.2365 36 12.4638 35.9148 12.6347 35.7623C15.1837 33.4275 17.5656 30.9389 19.765 28.3127C21.3845 26.3598 22.6944 24.6043 23.7312 23H0.268738Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </>,
  36
);

export const SquaredPeakyPinIcon = icon(
  <>
    <rect fill="currentColor" height="12" width="2" x="11" y="24" />
    <rect fill="currentColor" height="24" rx="2" width="24" />
  </>,
  36
);

export const SquaredPinIcon = icon(<rect fill="currentColor" height="24" rx="2" width="24" />, 24);

export const DiamondPinIcon = icon(
  <rect fill="currentColor" height="24" rx="2" transform="rotate(45 17 0.0294371)" width="24" x="17" y="0.0294371" />,
  36
);

export const TextIcon = icon(
  <path
    d="M18.5 4l1.16 4.35l-.96.26c-.45-.87-.91-1.74-1.44-2.18C16.73 6 16.11 6 15.5 6H13v10.5c0 .5 0 1 .33 1.25c.34.25 1 .25 1.67.25v1H9v-1c.67 0 1.33 0 1.67-.25c.33-.25.33-.75.33-1.25V6H8.5c-.61 0-1.23 0-1.76.43c-.53.44-.99 1.31-1.44 2.18l-.96-.26L5.5 4h13z"
    fill="currentColor"
  />,
  24
);

export const BanIcon = icon(
  <path
    d="M16 3C8.832 3 3 8.832 3 16s5.832 13 13 13s13-5.832 13-13S23.168 3 16 3zm0 2c6.086 0 11 4.914 11 11c0 2.727-.988 5.207-2.625 7.125L9.031 7.469A10.95 10.95 0 0 1 16 5zM7.625 8.875l15.344 15.656A10.95 10.95 0 0 1 16 27C9.914 27 5 22.086 5 16c0-2.727.988-5.207 2.625-7.125z"
    fill="currentColor"
  />,
  32
);

export const VerticalDotsIcon = icon(
  <path
    d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2z"
    fill="currentColor"
  />
);

export const EditIcon = icon(
  <path
    d="M25 4.031c-.766 0-1.516.297-2.094.875L13 14.781l-.219.219l-.062.313l-.688 3.5l-.312 1.468l1.469-.312l3.5-.688l.312-.062l.219-.219l9.875-9.906A2.968 2.968 0 0 0 25 4.03zm0 1.938c.234 0 .465.12.688.343c.445.446.445.93 0 1.375L16 17.376l-1.719.344l.344-1.719l9.688-9.688c.222-.222.453-.343.687-.343zM4 8v20h20V14.812l-2 2V26H6V10h9.188l2-2z"
    fill="currentColor"
  />,
  32
);

export const ExternalIcon = icon(
  <path
    d="M18 5v2h5.563L11.28 19.281l1.438 1.438L25 8.437V14h2V5zM5 9v18h18V14l-2 2v9H7V11h9l2-2z"
    fill="currentColor"
  />,
  32
);

export const GoogleIcon = icon(
  <>
    <path
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      fill="#4285F4"
    />
    <path
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      fill="#34A853"
    />
    <path
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      fill="#FBBC05"
    />
    <path
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      fill="#EB4335"
    />
  </>,
  256
);

export const FacebookLogoIcon = icon(
  <>
    <path
      d="M241.871 256.001c7.802 0 14.129-6.326 14.129-14.129V14.129C256 6.325 249.673 0 241.871 0H14.129C6.324 0 0 6.325 0 14.129v227.743c0 7.803 6.324 14.129 14.129 14.129h227.742"
      fill="#395185"
    />
    <path
      d="M176.635 256.001v-99.137h33.277l4.982-38.635h-38.259V93.561c0-11.186 3.107-18.809 19.148-18.809l20.459-.009V40.188c-3.54-.471-15.684-1.523-29.812-1.523c-29.498 0-49.692 18.005-49.692 51.071v28.493h-33.362v38.635h33.362v99.137h39.897"
      fill="#FFF"
    />
  </>,
  256
);

export const MapPlusIcon = icon(
  <path
    d="M9 3L3.36 4.9c-.2.07-.36.25-.36.48V20.5a.5.5 0 0 0 .5.5c.05 0 .1 0 .16-.03L9 18.9l4.16 1.46c-.1-.44-.16-.9-.16-1.36c0-.23 0-.46.04-.7L9 16.9V5l6 2.1v7.46c1.07-.96 2.47-1.56 4-1.56c.7 0 1.37.13 2 .36V3.5a.5.5 0 0 0-.5-.5h-.16L15 5.1L9 3m9 12v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z"
    fill="currentColor"
  />,
  24
);

export const CloudUploadIcon = icon(
  <path
    d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14a6 6 0 0 0 6 6h13a5 5 0 0 0 5-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6a4 4 0 0 1-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11l.5-.95A5.469 5.469 0 0 1 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5l1.53.11A2.98 2.98 0 0 1 22 15a3 3 0 0 1-3 3M8 13h2.55v3h2.9v-3H16l-4-4l-4 4z"
    fill="currentColor"
  />,
  24
);

export const CloudCheckIcon = icon(
  <path
    d="M19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.5 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3m.35-7.97A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.03A6.004 6.004 0 0 0 6 20h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.97M10 17l-3.5-3.5l1.41-1.42L10 14.17l4.59-4.58L16 11"
    fill="currentColor"
  />,
  24
);

export const UserIcon = icon(
  <path
    d="M16 5c-3.855 0-7 3.145-7 7c0 2.41 1.23 4.55 3.094 5.813C8.527 19.343 6 22.883 6 27h2c0-4.43 3.57-8 8-8s8 3.57 8 8h2c0-4.117-2.527-7.656-6.094-9.188A7.024 7.024 0 0 0 23 12c0-3.855-3.145-7-7-7zm0 2c2.773 0 5 2.227 5 5s-2.227 5-5 5s-5-2.227-5-5s2.227-5 5-5z"
    fill="currentColor"
  />,
  32
);

export const CrosshairQuestionIcon = icon(
  <path
    d="M3.05 13H1v-2h2.05C3.5 6.83 6.83 3.5 11 3.05V1h2v2.05c4.17.45 7.5 3.78 7.95 7.95H23v2h-2.05c-.45 4.17-3.78 7.5-7.95 7.95V23h-2v-2.05C6.83 20.5 3.5 17.17 3.05 13M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7s7-3.13 7-7s-3.13-7-7-7m-.87 12.25h1.75V15.5h-1.75v1.75M12 6.75c-1.93 0-3.5 1.57-3.5 3.5h1.75c0-.97.78-1.75 1.75-1.75s1.75.78 1.75 1.75c0 1.75-2.62 1.53-2.62 4.38h1.75c0-1.97 2.62-2.19 2.62-4.38c0-1.93-1.57-3.5-3.5-3.5z"
    fill="currentColor"
  />
);

export const ThreeDIcon = icon(
  <path
    d="M5 7h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5v-2h4v-2H6v-2h3V9H5V7m8 0h3a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-3V7m3 8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1v6h1z"
    fill="currentColor"
  />
);

export const LanguageIcon = icon(
  <>
    <path
      d="M48 112h288"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    ></path>
    <path
      d="M192 64v48"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    ></path>
    <path
      d="M272 448l96-224l96 224"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    ></path>
    <path
      d="M301.5 384h133"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    ></path>
    <path
      d="M281.3 112S257 206 199 277S80 384 80 384"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    ></path>
    <path
      d="M256 336s-35-27-72-75s-56-85-56-85"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    ></path>
  </>,
  512
);

export const FilmIcon = icon(
  <path
    d="M8 17v3h8v-7H8v4zm-2-2v-2H4v-2h2V9H4v6h2zm0 2H4v1a2 2 0 0 0 2 2v-3zm14-2V9h-2v2h2v2h-2v2h2zm0 2h-2v3a2 2 0 0 0 2-2v-1zm-4-8V4H8v7h8V9zm4-2V6a2 2 0 0 0-2-2v3h2zM6 7V4a2 2 0 0 0-2 2v1h2zm0-5h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"
    fill="currentColor"
  />
);

export const CameraIcon = icon(
  <path
    d="M12 10l-.94 2.06L9 13l2.06.94L12 16l.94-2.06L15 13l-2.06-.94L12 10m8-5h-3.17L15 3H9L7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 14H4V7h4.05l.59-.65L9.88 5h4.24l1.24 1.35l.59.65H20v12M12 8a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 8a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3a3 3 0 0 1-3 3z"
    fill="currentColor"
  />
);

export const PlayIcon = icon(
  <path
    d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-2 14.5l6-4.5l-6-4.5v9z"
    fill="currentColor"
  />
);

export const EyeIcon = icon(
  <path
    d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0z"
    fill="currentColor"
  />
);

export const TimerIcon = icon(
  <path
    d="M4.94 6.35c-.39-.39-.39-1.03 0-1.42a.996.996 0 0 1 1.41 0l6.72 5.38l.35.28c.78.78.78 2.05 0 2.83c-.78.78-2.05.78-2.83 0l-.28-.35l-5.37-6.72M12 20a8 8 0 0 0 8-8c0-2.21-.9-4.21-2.34-5.66l1.41-1.41A9.969 9.969 0 0 1 22 12a10 10 0 0 1-10 10A10 10 0 0 1 2 12h2a8 8 0 0 0 8 8m0-19a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2z"
    fill="currentColor"
  ></path>,
  24
);

export const StopIcon = icon(
  <path
    d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 2c4.41 0 8 3.59 8 8s-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8M9 9v6h6V9"
    fill="currentColor"
  />
);

export const PipetteIcon = icon(
  <path
    d="M21.384 7.331c.073-1.199-.354-2.388-1.146-3.179C19.506 3.421 18.445 3 17.326 3c-1.176 0-2.206.453-2.825 1.243c-.692.883-1.392 2.625-1.769 3.647l-1.616-1.617a.999.999 0 0 0-1.414 0a.997.997 0 0 0 0 1.414l.293.293l-5.231 5.232c-.375.375-.719.912-.968 1.516c-.019.043-1.726 4.328-.093 5.959c.527.526 1.33.707 2.178.707c1.778-.002 3.753-.787 3.783-.801c.602-.248 1.141-.592 1.514-.967l5.232-5.232l.293.293a.997.997 0 0 0 1.414 0a.999.999 0 0 0 0-1.414L16.5 11.657c1.023-.376 2.766-1.075 3.648-1.769c.721-.562 1.17-1.493 1.236-2.557zM5.119 19.275c-.247-.295-.105-1.508.154-2.58l2.422 2.423c-1.071.261-2.283.403-2.576.157zm4.645-1.061c-.188.188-.511.388-.865.533l-.116.042l-3.181-3.18l.043-.117c.146-.354.346-.678.533-.864l5.232-5.231l3.586 3.586l-5.232 5.231z"
    fill="currentColor"
  />
);
