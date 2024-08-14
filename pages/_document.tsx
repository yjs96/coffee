import { Html, Head, Main, NextScript } from 'next/document';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '커피 내기',
};

export default function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
