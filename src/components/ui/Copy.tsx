import classNames from "classnames";
import React, { AnchorHTMLAttributes } from "react";

export const Title: React.FC = ({ children }) => {
  return <h1 className="text-3xl mb-6">{children}</h1>;
};

export const Subtitle: React.FC = ({ children }) => {
  return <h2 className="mt-6 mb-2 font-medium">{children}</h2>;
};

export const Paragraph: React.FC = ({ children }) => {
  return <p className="text-sm my-2 text-justify">{children}</p>;
};

export const List: React.FC = ({ children }) => {
  return <ul className="text-sm my-2 list-disc list-inside">{children}</ul>;
};

export const Link: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, className, ...props }) => {
  return (
    <a
      className={classNames(className, {
        underline: true,
      })}
      {...props}
    >
      {children}
    </a>
  );
};
