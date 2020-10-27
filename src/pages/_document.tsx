import NextDocument, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { resetServerContext } from "react-beautiful-dnd";

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
        </body>
      </Html>
    );
  }
}

export default Document;
