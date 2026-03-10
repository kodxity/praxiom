'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    renderMathInElement?: (el: HTMLElement, opts?: object) => void;
    katex?: unknown;
  }
}

const KATEX_OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ],
  throwOnError: false,
};

export function KaTeXLoader() {
  const pathname = usePathname();

  // Re-render math whenever the route changes
  useEffect(() => {
    if (typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(document.body, KATEX_OPTS);
    }
  }, [pathname]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window.renderMathInElement === 'function') {
            window.renderMathInElement(document.body, KATEX_OPTS);
          }
        }}
      />
    </>
  );
}
