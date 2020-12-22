import * as Sentry from "@sentry/browser";
import NextDocument, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { resetServerContext } from "react-beautiful-dnd";

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error);
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error);
});

class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    resetServerContext();

    return NextDocument.getInitialProps(ctx);
  }

  render(): JSX.Element {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <script src="/scripts/ext.js" type="module"></script>
        </body>
      </Html>
    );
  }
}

export default Document;
