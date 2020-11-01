import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";

export const NavLink: React.FC<LinkProps & { children: ReactElement }> = ({ href, children }) => {
  const router = useRouter();

  let className = children.props.className || "";
  if (router.pathname === href) {
    className = `${className} font-medium`;
  }

  return <Link href={href}>{React.cloneElement(children, { className })}</Link>;
};
