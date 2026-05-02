"use client";

import { useCallback, useMemo, useRef, useState } from "react";

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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(320);

  const srcDoc = useMemo(() => buildEmailFrameDocument(html), [html]);

  const updateHeight = useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument) return;

    const nextHeight = Math.max(
      frameDocument.body.scrollHeight,
      frameDocument.documentElement.scrollHeight,
      240
    );
    setHeight(nextHeight);
  }, []);

  const handleLoad = useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument) return;

    resizeObserverRef.current?.disconnect();
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserverRef.current = resizeObserver;
    resizeObserver.observe(frameDocument.documentElement);
    if (frameDocument.body) {
      resizeObserver.observe(frameDocument.body);
    }

    const images = Array.from(frameDocument.images);
    images.forEach((image) => {
      image.addEventListener("load", updateHeight, { once: true });
      image.addEventListener("error", updateHeight, { once: true });
    });

    window.setTimeout(updateHeight, 250);
    window.setTimeout(updateHeight, 1000);
  }, [updateHeight]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={srcDoc}
      onLoad={handleLoad}
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      className="block w-full border-0 bg-white"
      style={{ height }}
    />
  );
}
