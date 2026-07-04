"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type HCaptchaApi = {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; callback: (token: string) => void }
  ) => string;
};

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
  }
}

/**
 * hCaptcha CAPTCHA. Рендерится только если задан
 * NEXT_PUBLIC_HCAPTCHA_SITE_KEY — иначе no-op (не мешает входу, пока
 * пользователь не завёл ключ). Токен уходит в onToken и передаётся в
 * supabase.auth.* через options.captchaToken.
 */
export function CaptchaWidget({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  const renderWidget = () => {
    if (rendered.current || !containerRef.current || !window.hcaptcha) return;
    rendered.current = true;
    window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey!,
      callback: onToken,
    });
  };

  useEffect(() => {
    renderWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div ref={containerRef} />
    </>
  );
}
