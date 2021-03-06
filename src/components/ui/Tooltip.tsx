import React, { useEffect, useState } from "react";
import Popover, { PopoverPlace } from "react-popover";

import { useStore } from "~/core/app";
import { theme } from "~/styles/tailwind";

export type TooltipProps = {
  text: JSX.Element | string;
  placement?: PopoverPlace;
  className?: string;
};

export type TooltipState = "hidden" | "shown" | "showing";

export const Tooltip: React.FC<TooltipProps> = ({ text, placement, children, className }) => {
  const [tooltipState, setTooltipState] = useState<TooltipState>("hidden");
  const touch = useStore((store) => store.platform.screen.touch);

  useEffect(() => {
    if (tooltipState !== "showing") {
      return;
    }

    const timeout = setTimeout(() => {
      setTooltipState("shown");
    }, 700);

    return () => clearTimeout(timeout);
  }, [tooltipState]);

  if (touch) {
    return <>{children}</>;
  }

  return (
    <Popover
      body={
        <div className="bg-white rounded px-2 py-1 text-xs border border-orange-300 shadow text-gray-800 flex flex-col space-y-2 z-50">
          {text}
        </div>
      }
      enterExitTransitionDurationMs={1}
      isOpen={tooltipState === "shown"}
      place={placement}
      style={{ fill: theme.colors.orange[300], marginLeft: -4, zIndex: theme.zIndex[50] }}
      tipSize={4}
      onOuterAction={() => {
        setTooltipState("hidden");
      }}
    >
      <span
        className={className}
        onMouseEnter={() => {
          setTooltipState("showing");
        }}
        onMouseLeave={() => {
          setTooltipState("hidden");
        }}
      >
        {children}
      </span>
    </Popover>
  );
};
