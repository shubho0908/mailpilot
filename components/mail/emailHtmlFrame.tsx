"use client";

import { useCallback, useMemo, useRef } from "react";

const EMAIL_FRAME_HEAD = `<base target="_blank" />
<style>
  :root {
    color-scheme: light;
  }

  html,
  body {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    min-width: 0;
    background: #ffffff;
    color: #18181b;
    overflow-wrap: anywhere;
    word-break: normal;
  }

  img,
  video {
    max-width: 100% !important;
    height: auto !important;
  }

  table {
    max-width: 100% !important;
  }
</style>`;

function buildEmailFrameDocument(html: string) {
  const headMarkup = `<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${EMAIL_FRAME_HEAD}
  </head>`;

  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${EMAIL_FRAME_HEAD}`);
  }

  if (/<html[\s>]/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1>${headMarkup}`);
  }

  if (/<body[\s>]/i.test(html)) {
    return `<!doctype html><html>${headMarkup}${html}</html>`;
  }

  return `<!doctype html><html>${headMarkup}<body>${html}</body></html>`;
}

interface EmailHtmlFrameProps {
  html: string;
  title: string;
}

export function EmailHtmlFrame({ html, title }: EmailHtmlFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = useMemo(() => buildEmailFrameDocument(html), [html]);

  const handleLoad = useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument) return;

    // Enable scrolling within the iframe for long content
    frameDocument.documentElement.style.overflowY = "auto";
    if (frameDocument.body) {
      frameDocument.body.style.overflowY = "auto";
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={srcDoc}
      onLoad={handleLoad}
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      className="block w-full border-0 bg-white"
      style={{ height: "400px" }}
    />
  );
}
