import NextDocument, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { resetServerContext } from "react-beautiful-dnd";

class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    resetServerContext();

    return NextDocument.getInitialProps(ctx);
  }

  render(): JSX.Element {
    const lang = this.props.__NEXT_DATA__?.props?.pageProps?.lang ?? "en";

    return (
      <Html lang={lang}>
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
