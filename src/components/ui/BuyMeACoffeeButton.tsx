import classNames from "classnames";
import Head from "next/head";
import React, { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLAnchorElement>;

export const BuyMeACoffeeButton: React.FC<Props> = ({ className, ...props }) => {
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet" />
      </Head>
      <a
        {...props}
        className={classNames(className, {
          "bmc-button transform scale-75 origin-top-left": true,
        })}
        href="https://www.buymeacoffee.com/pelica"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img alt="Buy us a coffee" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" />
        <span>Buy us a coffee</span>
        <style jsx>
          {`
            .bmc-button {
              display: flex;
            }
            .bmc-button img {
              height: 34px;
              width: 35px;
              margin: 0 5px 1px 0;
              box-shadow: none;
              border: none;
              vertical-align: middle;
            }
            .bmc-button {
              padding: 7px 15px 7px 10px;
              line-height: 35px;
              height: 51px;
              width: fit-content;
              text-decoration: none;
              color: #111;
              background-color: #ffdd00;
              border-radius: 8px;
              border: 1px solid transparent;
              font-size: 24px;
              letter-spacing: 0.6px;
              box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5);
              font-family: "Cookie", cursive;
              box-sizing: border-box;
              white-space: nowrap;
            }
            .bmc-button:hover,
            .bmc-button:active,
            .bmc-button:focus {
              text-decoration: none;
              box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5);
              opacity: 0.85;
              color: #111;
            }
          `}
        </style>
      </a>
    </>
  );
};
