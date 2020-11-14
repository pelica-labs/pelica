import classNames from "classnames";
import React from "react";

type Props = {
  dense?: boolean;
};

export const Container: React.FC<Props> = ({ dense = false, children }) => {
  return (
    <div
      className={classNames({
        "flex flex-col items-center max-w-4xl tu mx-auto px-4 min-h-full b-8": true,
        "pt-24 pb-8": dense,
        "pt-32 pb-12": !dense,
      })}
    >
      {children}
    </div>
  );
};
