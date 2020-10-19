import React, { SVGAttributes } from "react";

export const icons = (): { [key: string]: Icon } => ({
  fire: FireIcon,
  target: TargetIcon,
  kabaddi: KabaddiIcon,
  close: CloseIcon,
  search: SearchIcon,
  pencil: PencilIcon,
  hand: HandIcon,
  paint: PaintIcon,
  share: ShareIcon,
  ruler: RulerCompassIcon,
  pin: PinIcon,
  compass: CompassIcon,
  plus: PlusIcon,
  palette: PaletteIcon,
});

type Props = SVGAttributes<SVGElement> & {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
};

export type Icon = React.FC<Props>;

const icon = (path: JSX.Element, size = 24): Icon => {
  return function Icon({ ...props }) {
    return (
      <svg {...props} viewBox={`0 0 ${size}, ${size}`} xmlns="http://www.w3.org/2000/svg">
        {path}
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
    d="M15 19l-7-7 7-7"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  />
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
