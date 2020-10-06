import React from "react";

type Props = {
  className?: string;
};

type Icon = React.FC<Props>;

const icon = (path: JSX.Element): Icon => {
  return function Icon({ className }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
);

export const SearchIcon = icon(
  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
);

export const FireIcon = icon(
  <>
    <path
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </>
);

export const ChevronLeftIcon = icon(
  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
);

export const PencilIcon = icon(
  <path
    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
  />
);

export const HandIcon = icon(
  <path
    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
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
    d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 1 0 3 5 9.71C17 12 17 10 17 9a5 5 0 0 0-5-5z"
    fill="currentColor"
  />
);

export const DownloadIcon = icon(
  <path d="M13 5v6h1.17L12 13.17L9.83 11H11V5h2m2-2H9v6H5l7 7l7-7h-4V3m4 15H5v2h14v-2z" fill="currentColor"></path>
);

export const UndoIcon = icon(
  <path
    d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
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

export const TrashIcon = icon(
  <path
    d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9M7 6h10v13H7V6m2 2v9h2V8H9m4 0v9h2V8h-2z"
    fill="currentColor"
  />
);

export const PlusIcon = icon(
  <path
    d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m1 5h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"
    fill="currentColor"
  />
);
