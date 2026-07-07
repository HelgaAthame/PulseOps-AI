"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Script from "next/script";

type HCaptchaApi = {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; size?: "invisible" }
  ) => string;
  execute: (
    widgetId: string,
    opts: { async: true }
  ) => Promise<{ response: string }>;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
  }
}

/** Императивный API виджета: запросить свежий токен по требованию. */
export type CaptchaHandle = {
  /** Возвращает одноразовый токен hCaptcha (или undefined, если капча не настроена). */
  execute: () => Promise<string | undefined>;
};

/**
 * Невидимая hCaptcha. Не показывает чекбокс — токен запрашивается в момент
 * действия (клик по «войти»/passkey) через `execute()`. Так все методы входа
 * остаются в один клик, а капча срабатывает незаметно (или показывает challenge
 * только при подозрении). Если NEXT_PUBLIC_HCAPTCHA_SITE_KEY не задан — no-op,
 * `execute()` возвращает undefined и вход идёт без токена.
 */
export const CaptchaWidget = forwardRef<
  CaptchaHandle,
  Readonly<Record<never, never>>
>(function CaptchaWidget(_props, ref) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const renderWidget = () => {
    if (widgetId.current !== null || !containerRef.current || !window.hcaptcha)
      return;
    widgetId.current = window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey!,
      size: "invisible",
    });
  };

  useEffect(() => {
    renderWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      async execute() {
        if (!siteKey || widgetId.current === null || !window.hcaptcha) {
          return undefined;
        }
        const { response } = await window.hcaptcha.execute(widgetId.current, {
          async: true,
        });
        return response;
      },
    }),
    [siteKey]
  );

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
});
