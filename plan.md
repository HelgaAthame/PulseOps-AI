# PulseOps — план и документация проекта

> **Что это.** Учебный fullstack-проект: симуляция SaaS-аналитики. События (
> регистрации, платежи, отток) → метрики (MRR/ARR/churn) → AI-аналитик →
> realtime-дашборд. Цель — portfolio-grade проект уровня mid frontend, который
> «выглядит как настоящий SaaS-продукт, а не пет-проект».
>
> Этот файл ведётся как **живая документация**: сверху — актуальный статус и
> технические решения, ниже — исходное видение и roadmap. Обновляется вместе с
> кодом. Легенда статусов: ✅ сделано · 🚧 в работе · ⬜ запланировано · 💡 бэклог.

---

## 📊 Текущий статус

| День | Тема | Статус |
|------|------|--------|
| Day 1 | Каркас UI (Next.js, Tailwind, shadcn/ui, layout) | ✅ |
| Day 2 | БД + Auth (Drizzle, Supabase Auth, защита роутов) | ✅ |
| Day 3 | Event-система (генератор + живая лента) | ✅ |
| Auth+ | Авторизация: Passkeys ✅, Google ✅, hCaptcha ✅ (всё вживую) | ✅ |
| Day 4 | Analytics-движок (MRR/churn, графики) | 🚧 движок ✅, графики ⬜ |
| Day 5 | Realtime (Supabase subscriptions) | ⬜ |
| Day 6 | AI-аналитик («Explain this system») | ⬜ |
| Day 7 | Полировка + деплой на Vercel | ⬜ |

**Сделано в этой итерации:** Day 3 завершён; авторизация — весь код написан и
собирается, осталось включить сервисы (Google Cloud, Cloudflare, настройки в
Supabase Dashboard) — см. чеклист ниже; Day 4 — analytics-движок готов и
проверен, реальные метрики уже в карточках дашборда. Осталось нарисовать
графики (отложено до визуального ревью).

---

## 🧱 Стек и технические решения

Каждое решение — с обоснованием, чтобы план работал как документация.

| Область | Выбор | Почему |
|---------|-------|--------|
| Фреймворк | **Next.js 16** (App Router, Turbopack) | Fullstack в одном репо: SSR + API routes. |
| Язык | **TypeScript** (strict) | Типобезопасность сквозь весь стек. |
| Стили | **Tailwind CSS v4** | Быстрый, современный utility-CSS. |
| UI-кит | **shadcn/ui** (base color neutral) | Не библиотека, а копируемые компоненты в `shared/ui` — полный контроль. |
| Иконки | **lucide-react** | Стандарт для shadcn. |
| БД | **Postgres** (через Supabase) | Реляционная, строгая схема, foreign keys. |
| ORM | **Drizzle ORM** | Схема как TS-объекты без декораторов; лёгкий рантайм (важно для serverless на Vercel); миграции через `drizzle-kit`. Заменили TypeORM на Day 2 — см. «История решений». |
| Auth | **Supabase Auth** | OAuth, passkeys, MFA, CAPTCHA — всё нативно и бесплатно. Единый источник истины о сессии. **NextAuth сознательно НЕ используем** (конфликтовал бы с Supabase Auth). |
| Realtime | **Supabase Realtime** | Live-подписки на изменения таблиц (Day 5). |
| Валидация | **zod** | Проверка входных данных на границе API. |
| API-слой | **Next.js Route Handlers** | Без tRPC — эндпоинты вида `/api/events/ingest` ближе к REST/webhook. |
| Архитектура | **Feature-Sliced Design (FSD)** | Явное разделение слоёв, масштабируемость. |

### История решений (почему стек именно такой)
- **TypeORM → Drizzle (Day 2).** Начали с TypeORM, но он тянет decorator/
  `reflect-metadata`, требует `serverExternalPackages` для обхода динамических
  `require()` драйверов и отдельный ts-node CLI для миграций — трение,
  нехарактерное для serverless. Пока БД была пустой, заменили на Drizzle:
  меньше магии, легче рантайм, SQL-first миграции.
- **NextAuth отклонён.** Совет использовать NextAuth не подходит: мы уже на
  Supabase Auth. Две auth-системы = два источника истины о сессии и конфликты.

---

## 🗂️ Архитектура (Feature-Sliced Design)

```
src/
├── app/                      # Слой FSD "app" = роутинг Next.js
│   ├── (dashboard)/          # route group: защищённые страницы (проверка auth в layout)
│   │   ├── layout.tsx        # sidebar + topbar + редирект на /login + sync профиля
│   │   └── page.tsx          # "Обзор" (/)
│   ├── login/                # публичная страница входа
│   ├── api/                  # Route Handlers (серверные эндпоинты)
│   └── layout.tsx            # корневой layout (шрифты, <html>)
├── views/                    # FSD "pages" (переименован: конфликт с Next.js)
│   ├── dashboard/            # экран "Обзор"
│   └── login/                # экран входа
├── widgets/                  # композитные блоки UI
│   ├── sidebar/  topbar/  event-feed/
├── features/                 # пользовательские действия
│   └── auth/                 # Google/passkey/hCaptcha/sign-out кнопки
├── entities/                 # бизнес-сущности (таблицы + zod + хелперы)
│   ├── user/  event/  metric/
├── shared/                   # переиспользуемое
│   ├── ui/                   # shadcn-компоненты
│   ├── lib/                  # cn() и утилиты
│   ├── config/               # nav и конфиги
│   └── api/                  # db (Drizzle) + supabase клиенты
├── proxy.ts                  # Next.js 16: middleware переименован в proxy (обновляет сессию Supabase)
└── ...
```

**Нюансы FSD в этом проекте:**
- Слой FSD `pages` → папка `views` (иначе конфликт с Next.js Pages).
- Слой FSD `app` = роутинг Next (`src/app/`).
- shadcn/ui живёт в `shared/ui`, `cn` — в `shared/lib/utils`.

---

## 🗄️ Модель данных

Схема описана в Drizzle (`src/entities/*/model/*.table.ts`), миграции — в
`src/shared/api/db/migrations/`.

- **`users`** — теневая таблица профилей приложения. `id` совпадает с
  `auth.users.id` из Supabase Auth (сам `auth.users` нами не управляется).
  Заполняется автоматически при входе (`ensureUserProfile`).
- **`events`** — симулированные бизнес-события SaaS. Скоуп по владельцу-аккаунту
  (`owner_id` → `users.id`), «клиент» события (`customer_id`) — синтетический
  end-user симуляции (не аккаунт приложения). Типы: `user_signed_up`,
  `subscription_created`, `payment_success`, `payment_failed`, `churn_detected`.
- **`metrics`** — снимки посчитанных метрик во времени (история, а не текущее
  состояние), скоуп по `owner_id`. Типы: `mrr`, `arr`, `churn_rate`,
  `conversion_rate`, `active_users`.

> **Почему owner_id + customer_id.** `owner_id` изолирует данные разных
> залогиненных пользователей (важно для демо портфолио — два рекрутера не видят
> данные друг друга). `customer_id` — это «клиент» симулируемого SaaS; для
> аналитики «active users» = число уникальных `customer_id`, поэтому их должно
> быть много и они не привязаны к аккаунтам приложения.

---

## 🔐 Авторизация (план)

Всё на **Supabase Auth**, бесплатно, без второй auth-библиотеки.

| Метод | Код | Что нужно от пользователя, чтобы заработало |
|-------|-----|---------------------------------------------|
| Email + пароль | ✅ работает | — (готово на Day 2) |
| **Google OAuth** | ✅ работает (проверено вживую) | Настроено: OAuth client в Google Cloud (redirect на `<ref>.supabase.co/auth/v1/callback`), Client ID/Secret в Supabase, Redirect URLs `http://localhost:3000/**`. Вход через Google → callback → профиль в public.users подтверждён. |
| **Passkeys / биометрия** 🌟 | ✅ работает (проверено вживую) | Включено в Dashboard (RP ID `localhost`, origin `http://localhost:3000`). Регистрация и вход по Windows Hello прошли end-to-end. На проде — добавить домен в RP origins. |
| **hCaptcha CAPTCHA** | ✅ работает (проверено вживую) | Cloudflare Turnstile отпал (заблокировал регистрацию с VPN/датацентр-IP) → выбран **hCaptcha**. Site Key в `.env` (`NEXT_PUBLIC_HCAPTCHA_SITE_KEY`), account-level Secret Key **в Supabase** (Attack Protection → Captcha → hCaptcha). Вход с капчей проверен. |
| 2FA (TOTP) | 💡 бэклог | Избыточно при passkeys; отложено. |

### ✅ Что уже сделано в коде (Auth)
- Браузерный Supabase-клиент включает passkeys (`auth.experimental.passkey`).
- `features/auth/`: `GoogleButton`, `PasskeySignInButton`, `PasskeyManager`,
  `CaptchaWidget` (hCaptcha), `SignOutButton`.
- Страница входа `/login`: кнопки Google + passkey, разделитель, форма
  email/пароль с передачей `captchaToken` (когда hCaptcha настроен).
  ⚠️ Капча в Supabase **глобальная** (на весь проект), поэтому токен передаётся
  и во вход по **passkey** (`signInWithPasskey({ options: { captchaToken } })`),
  иначе passkey-вход ломается при включённой капче.
- `/auth/callback` — обмен OAuth-кода на сессию (PKCE).
- `/settings` — карточка аккаунта + **менеджер passkeys** (`PasskeyManager`):
  список зарегистрированных (имя, когда добавлен/использован), добавление и
  удаление через `supabase.auth.passkey.list()/registerPasskey()/passkey.delete()`.
  Passkeys хранятся в beta-таблице `auth.webauthn_credentials` (не `mfa_factors`).
- Кнопка выхода в topbar.
- `CaptchaWidget` — no-op, пока не задан site key (вход не блокируется).

### 🔧 Чеклист настройки для пользователя (пошагово)
1. **Google OAuth:** ✅ настроено и работает. Google Cloud → OAuth client (Web),
   redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, Client ID/
   Secret в Supabase, test users в Audience.
   ⚠️ **НЕ ЗАБЫТЬ на Day 7 (деплой):** опубликовать OAuth-приложение
   (Google Auth Platform → **Publish app** → In production), иначе входить
   смогут только тест-пользователи, а refresh-токены живут 7 дней. Scope
   базовые (email/profile) → публикация без ревью Google, в один клик.
2. **Passkeys:** Supabase Dashboard → Authentication → Passkeys → включить.
   RP Display Name: `PulseOps`. RP ID: `localhost` (для dev) или домен прода.
   RP Origins: `http://localhost:3000` (dev) и/или прод-URL.
3. **hCaptcha:** dashboard.hcaptcha.com → создать sitekey (hostname `localhost`).
   Site Key → `.env.local` (`NEXT_PUBLIC_HCAPTCHA_SITE_KEY`). Secret Key →
   Supabase Dashboard → Authentication → Attack Protection → Captcha → включить,
   выбрать hCaptcha, вставить secret.
   (Cloudflare Turnstile не подошёл — заблокировал регистрацию с VPN/датацентр-IP.)

> Всё это можно включать по отдельности и в любой момент — код уже готов
> «повернуть выключатель». Без настройки работает вход по email/паролю.

**Заметки по реализации:**
- **Passkeys** = вход по Face ID / Touch ID / Windows Hello. Нативная поддержка
  Supabase (beta, с мая 2026), нужна `@supabase/supabase-js` ≥ 2.105 (у нас
  2.110 ✅). Требует явного opt-in при создании клиента. **Внешний сервис не
  нужен** — это и есть «биометрия через сервис», о которой шла речь.
- **Google OAuth:** client id/secret настраиваются в Supabase Dashboard;
  приложение вызывает `supabase.auth.signInWithOAuth({ provider: 'google' })`.
  Нужен callback-роут `/auth/callback` для обмена кода на сессию.
- **hCaptcha:** приватная альтернатива reCAPTCHA. Site key — публичный
  (фронтенд), secret — в Supabase (он сам верифицирует токен).

**Env-переменные авторизации** (плейсхолдеры, значения подставит пользователь):
- `NEXT_PUBLIC_SITE_URL` — базовый URL для OAuth/passkey redirect.
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` — публичный ключ hCaptcha.

---

## ⚙️ Как запускать (dev)

```bash
npm run dev          # дев-сервер (Turbopack)
npm run build        # прод-сборка
npm run lint         # ESLint

npm run db:generate  # сгенерировать миграцию из *.table.ts (drizzle-kit)
npm run db:migrate   # применить миграции к БД
```

**Подключение к БД:** через Supabase **Session Pooler** (IPv4) —
`aws-0-<region>.pooler.supabase.com:5432`, пользователь `postgres.<project-ref>`.
Прямое подключение `db.<ref>.supabase.co` не резолвится по DNS в текущей сети.
Строка в `DATABASE_URL` (`.env.local`).

Переменные окружения — см. `.env.example`.

---

# ⚡ Core System Design (исходное видение)

## 1. Event System (Core engine) — Day 3 🚧
События SaaS: `user_signed_up`, `subscription_created`, `payment_success`,
`payment_failed`, `churn_detected`. Хранятся в таблице `events` (Supabase).

## 2. Analytics Layer — Day 4 ⬜
Производные метрики: MRR, ARR, churn rate, conversion rate, active users.
Считаются на сервере (Route Handlers), пишутся снимками в `metrics`.

## 3. AI Analyst Layer (WOW) — Day 6 ⬜
Кнопка «Explain what is happening». AI получает последние ~100 событий +
снимок аналитики, возвращает insights / аномалии / рекомендации.
> Для AI использовать современную модель Claude (напр. Claude Sonnet) через
> Anthropic API — уточнить при реализации.

## 4. Realtime System — Day 5 ⬜
Supabase Realtime: live-лента событий, live-обновление графиков —
«ощущение живого дашборда как у Stripe».

## 5. Dashboard Builder (WOW+) — 💡 бэклог
Drag & drop виджеты, ресайз графиков, сохранение раскладки на пользователя.

---

# 🗓️ 7-Day MVP Plan (с отметками статуса)

## Day 1 — Setup & UI foundation ✅
- ✅ Next.js project setup
- ✅ Tailwind config
- ✅ shadcn/ui
- ✅ Layout (sidebar + topbar)
- ✅ Dashboard page skeleton

## Day 2 — Database + Auth ✅
- ✅ Supabase project
- ✅ Таблицы users / events / metrics (через Drizzle-миграции)
- ✅ Supabase auth (email+пароль)
- ✅ Защита роутов дашборда (route group + проверка в layout)

## Day 3 — Event system 🚧
- 🚧 Модель events с owner/customer скоупом
- 🚧 `/api/events/ingest` (owner из auth) + `/api/events/simulate` (мок-генератор)
- 🚧 Event list UI (живая лента)

## Day 4 — Analytics engine 🚧
- ✅ Расчёт MRR / ARR / churn / conversion / active users / signups / revenue —
  чистая функция `computeAnalytics(events)` в `entities/metric/model/analytics.ts`
  (проверена детерминированным тестом + roundtrip на реальной БД)
- ✅ `/api/analytics` (owner из auth → все события → снимок)
- ✅ Реальные числа в карточках дашборда (MRR/ARR/active/churn)
- ⬜ **Графики** — выбран **shadcn charts (на Recharts)** как когерентный к
  shadcn/ui. Отложено до ревью пользователем (нужен визуальный контроль;
  Playwright сейчас недоступен). Перед версткой — прочитать skill `dataviz`.
- 💡 На проде агрегаты считать в SQL (сейчас — в JS, ок для симуляции)

## Day 5 — Real-time updates ⬜
- ⬜ Supabase realtime subscriptions
- ⬜ Live-лента и live-обновление графиков

## Day 6 — AI Analyst ⬜
- ⬜ `/api/ai/analyze` (события + метрики → инсайты)
- ⬜ Кнопка «Explain this system»

## Day 7 — Polish + Portfolio ⬜
- ⬜ Анимации, loading/empty states, dark mode, spacing
- ⬜ README на английском (для рекрутеров)
- ⬜ Деплой на Vercel (+ интеграции Supabase↔GitHub/Vercel, см. бэклог)
- ⬜ **Auth под прод:** опубликовать Google OAuth (Publish app → In production);
  обновить в Google Cloud redirect и в Supabase Site URL / Redirect URLs на
  прод-домен; passkeys RP ID/origins → прод-домен; hCaptcha hostname → прод.

---

# 🎨 UI Direction (важно)

**Цель: вайб Stripe / Linear / Vercel.**
- много воздуха, мягкие границы, тонкие тени, приглушённые цвета
- никакого неона; плотные, но чистые таблицы; сильная типографика
- полированный dark mode

Референсы: Stripe Dashboard, Linear, Vercel Dashboard, Notion AI, Tremor.

---

# 💡 Бэклог / что ещё можно сделать

Идеи сверх MVP — чтобы проект тянул на senior-level flex:

- **Multi-tenant** — компании/воркспейсы (частично заложено через `owner_id`).
- **RBAC** — роли admin/user.
- **Audit logs** — журнал действий.
- **Billing-симуляция** — мок Stripe.
- **Anomaly detection** — алгоритм поверх событий (усилит AI-слой).
- **2FA (TOTP)** — второй фактор поверх пароля.
- **Dashboard builder** — drag & drop виджеты (WOW+).
- **Supabase↔GitHub/Vercel интеграции** — авто-деплой и синк env (на Day 7).
- **RLS-политики** в Postgres — защита данных на уровне БД (не только в коде).
- **Тесты** — Vitest (unit для аналитики) + Playwright (e2e).
- **Отдельная таблица `customers`** — полноценная симуляция end-users вместо
  синтетических `customer_id`.

---

# 🚀 Что должен почувствовать рекрутер

> «Это выглядит как настоящий SaaS-продукт, а не учебный проект.»

Чеклист WOW-эффекта: realtime-обновления · AI-объяснение · симуляция SaaS-метрик
· плотность UI как у Stripe · event-streaming · чистая архитектура · passkeys/
биометрия · полированный dark mode.
