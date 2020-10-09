import React from "react";

type Props = {
  color: string;
};

export const Pin: React.FC<Props> = ({ color }) => {
  return (
    <svg fill="none" height="73" viewBox="0 0 54 73" width="54" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M27 0C12.0883 0 0 12.0883 0 27C0 37.2206 5.67894 46.1149 14.0535 50.6994C14.2405 53.6638 14.9156 56.5811 16.0553 59.3325C17.4121 62.6082 19.4009 65.5847 21.9081 68.0919C23.5802 69.7639 25.4609 71.2054 27.5 72.3827C29.5391 71.2054 31.4198 69.7639 33.0919 68.0919C35.5991 65.5847 37.5879 62.6082 38.9447 59.3325C40.1605 56.3974 40.8476 53.2736 40.9774 50.1051C48.7837 45.3726 54 36.7955 54 27C54 12.0883 41.9117 0 27 0Z"
        fill={color}
      />
      <g filter="url(#filter0_d)">
        <circle cx="27" cy="27" fill="white" r="23" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="54"
          id="filter0_d"
          width="54"
          x="0"
          y="4"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
        </filter>
      </defs>
    </svg>
  );
};
