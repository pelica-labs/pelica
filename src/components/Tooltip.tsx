import React, { useEffect, useState } from "react";
import Popover, { PopoverPlace } from "react-popover";

import { theme } from "~/styles/tailwind";

export type TooltipProps = {
  text: JSX.Element | string;
  placement?: PopoverPlace;
};

export type TooltipState = "hidden" | "shown" | "showing";

export const Tooltip: React.FC<TooltipProps> = ({ text, placement, children }) => {
  const [tooltipState, setTooltipState] = useState<TooltipState>("hidden");

  useEffect(() => {
    if (tooltipState !== "showing") {
      return;
    }

    const timeout = setTimeout(() => {
      setTooltipState("shown");
    }, 700);

    return () => clearTimeout(timeout);
  }, [tooltipState]);

  return (
    <Popover
      body={
        <div className="bg-white rounded px-2 py-1 text-xs border border-orange-300 shadow text-gray-800 flex flex-col space-y-2">
          {text}
        </div>
      }
      enterExitTransitionDurationMs={1}
      isOpen={tooltipState === "shown"}
      place={placement}
      style={{ fill: theme.colors.orange[300], marginLeft: -4 }}
      tipSize={4}
      onOuterAction={() => {
        setTooltipState("hidden");
      }}
    >
      <span
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
