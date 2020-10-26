import React, { SVGAttributes } from "react";

type PinConfiguration = {
  component: React.FC<Props>;
  dimensions: [number, number];
  offset: number;
};

/**
 * List of available pins as SVG components
 *
 * ⚠ When optimising those SVGs before inserting them in the code,
 * ⚠ make sure not to omit this part: xmlns="http://www.w3.org/2000/svg"
 * ⚠ Otherwise the SVG can't be properly drawn in a canvas.
 */
export const pins = (): { [key: string]: PinConfiguration } => ({
  pelipin: { component: Pelipin, dimensions: [54, 72], offset: 11 },
  peaky: { component: PeakyPin, dimensions: [64, 72], offset: 12 },
  classical: { component: ClassicalPin, dimensions: [64, 72], offset: 12 },
  round: { component: RoundPin, dimensions: [72, 72], offset: 15 },
  squaredPelipin: { component: SquaredPelipin, dimensions: [56, 72], offset: 9 },
  squaredClassical: { component: SquaredClassicalPin, dimensions: [56, 72], offset: 9 },
  squaredPeaky: { component: SquaredPeakyPin, dimensions: [56, 72], offset: 9 },
  squared: { component: SquaredPin, dimensions: [67.2, 72], offset: 12 },
});

type Props = SVGAttributes<SVGElement> & {
  color: string;
};

export const Pelipin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="73" viewBox="0 0 54 73" width="54" xmlns="http://www.w3.org/2000/svg" {...props}>
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

export const PeakyPin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 36" width="32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="14" fill={color} r="14" />
      <rect fill={color} height="9" width="2" x="15" y="27" />
      <g filter="url(#filter0_d)">
        <circle cx="16" cy="14" fill="white" r="12" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="32"
          id="filter0_d"
          width="32"
          x="0"
          y="2"
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

export const ClassicalPin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 36" width="32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16 0C8.28036 0 2 6.28036 2 14C2 17.75 4.27193 22.5657 8.75264 28.3127C10.8055 30.9389 13.0286 33.4275 15.4076 35.7623C15.5671 35.9148 15.7793 36 16 36C16.2207 36 16.4329 35.9148 16.5924 35.7623C18.9714 33.4275 21.1945 30.9389 23.2474 28.3127C27.7281 22.5657 30 17.75 30 14C30 6.28036 23.7196 0 16 0Z"
        fill={color}
      />
      <g filter="url(#filter0_d)">
        <circle cx="16" cy="14" fill="white" r="12" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="32"
          id="filter0_d"
          width="32"
          x="0"
          y="2"
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

export const RoundPin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="14" fill={color} r="14" />
      <g filter="url(#filter0_d)">
        <circle cx="16" cy="14" fill="white" r="12" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="32"
          id="filter0_d"
          width="32"
          x="0"
          y="2"
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

export const SquaredPelipin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="36" viewBox="0 0 28 36" width="28" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect fill={color} height="24" rx="2" width="24" x="2" />
      <path
        clipRule="evenodd"
        d="M21 24.0114C20.9985 25.8272 20.6364 27.625 19.9343 29.3026C19.2307 30.9838 18.1995 32.5113 16.8995 33.798C16.0325 34.6561 15.0573 35.3958 14 36C12.9427 35.3958 11.9675 34.6561 11.1005 33.798C9.80048 32.5113 8.76925 30.9838 8.06568 29.3026C7.36344 27.6246 7.00135 25.8264 7 24.0102L7 24H21C21 24.0038 21 24.0076 21 24.0114Z"
        fill={color}
        fillRule="evenodd"
      />
      <g filter="url(#filter0_d)">
        <rect fill="white" height="20" rx="1" width="20" x="4" y="2" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="28"
          id="filter0_d"
          width="28"
          x="0"
          y="2"
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

export const SquaredClassicalPin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="36" viewBox="0 0 28 36" width="28" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect fill={color} height="24" rx="2" width="24" x="2" />
      <path
        clipRule="evenodd"
        d="M2.26874 23C3.30559 24.6043 4.61548 26.3598 6.23496 28.3127C8.42164 30.9496 10.8163 33.4275 13.3652 35.7623C13.5361 35.9148 13.7635 36 14 36C14.2365 36 14.4638 35.9148 14.6347 35.7623C17.1837 33.4275 19.5656 30.9389 21.765 28.3127C23.3845 26.3598 24.6944 24.6043 25.7312 23H2.26874Z"
        fill={color}
        fillRule="evenodd"
      />
      <g filter="url(#filter0_d)">
        <rect fill="white" height="20" rx="1" width="20" x="4" y="2" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="28"
          id="filter0_d"
          width="28"
          x="0"
          y="2"
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

export const SquaredPeakyPin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="36" viewBox="0 0 28 36" width="28" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect fill={color} height="12" width="2" x="13" y="24" />
      <rect fill={color} height="24" rx="2" width="24" x="2" />
      <g filter="url(#filter0_d)">
        <rect fill="white" height="20" rx="1" width="20" x="4" y="2" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="28"
          id="filter0_d"
          width="28"
          x="0"
          y="2"
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

export const SquaredPin: React.FC<Props> = ({ color, ...props }) => {
  return (
    <svg fill="none" height="30" viewBox="0 0 28 30" width="28" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect fill={color} height="24" rx="2" width="24" x="2" />
      <g filter="url(#filter0_d)">
        <rect fill="white" height="20" rx="1" width="20" x="4" y="2" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="28"
          id="filter0_d"
          width="28"
          x="0"
          y="2"
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
