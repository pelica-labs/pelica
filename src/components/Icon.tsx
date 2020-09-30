import React from "react";

type Props = {
  className?: string;
};

type Icon = React.FC<Props>;

export const KabaddiIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M11.2 10.6c1 1 2.2 1.5 3.6 1.5l.1 2.1c-1.9 0-3.6-.7-5.1-2.1l-.7-.7l-2.3 2.4L9 15.9v6H7v-5.2l-1.3-1.2v2.2L1.5 22L.1 20.6L3.7 17l-1.2-3.5c-.2-.6.1-1.1.6-1.5l3.3-3.3c.4-.5.9-.7 1.4-.7c.5 0 .8.1 1.1.3l2.3 2.3M24 11.9h-2V8.5l-1.8-.7l.9 4.4l1 5.2l.9 4.4h-2.1l-1.8-8l-2.1 2v6h-2v-7.5l2.1-2l-.6-3c-.6.6-1.3 1.2-2.1 1.6c-.9-.1-1.8-.5-2.5-1.2c1.6-.3 2.7-1.1 3.4-2.3l1-1.6c.6-1 1.5-1.3 2.6-.8L24 7.2v4.7M11.4 4.4c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2M16.5.3c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2z"
      fill="currentColor"
    ></path>
  </svg>
);

export const CloseIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

export const SearchIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export const FireIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </svg>
);

export const ChevronLeftIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

export const PencilIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export const HandIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export const PaintIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M20.71 4.63l-1.34-1.34c-.37-.39-1.02-.39-1.41 0L9 12.25L11.75 15l8.96-8.96c.39-.39.39-1.04 0-1.41M7 14a3 3 0 0 0-3 3c0 1.31-1.16 2-2 2c.92 1.22 2.5 2 4 2a4 4 0 0 0 4-4a3 3 0 0 0-3-3z"
      fill="currentColor"
    ></path>
  </svg>
);

export const ShareIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export const LineWidthIcon: Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M3 17h18v-2H3v2m0 3h18v-1H3v1m0-7h18v-3H3v3m0-9v4h18V4H3z" fill="currentColor"></path>
  </svg>
);
