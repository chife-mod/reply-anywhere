# Reply Anywhere — Implementation & Stack Decision (ADR)

> **Что это:** стабильная запись решения по реализации. Меняется редко — только когда
> меняется само архитектурное решение. Живой статус — в [`../STATUS.md`](../STATUS.md);
> план движения — в [`PLAN.md`](PLAN.md).

**Дата решения:** 2026-07-01 · **Статус:** фундамент реализован и проверен.
**Разделение труда:** визуальный дизайн — клиент (Олег, в Figma). Фронтенд-инжиниринг +
перенос Figma→код — этот репозиторий.

---

## Решение (одной строкой)

**Astro 6 pure SSG + GSAP (+ нативные CSS scroll-driven) + самохостинг шрифтов +
AI-SEO слой + маленький API-Worker → деплой как Cloudflare Workers Static Assets.
Без CMS** (контент в типизированных data-файлах, правки через git).

## Почему так

Взято целиком с проекта **Verifly Web** (`/Users/oleg/Dev/shot/03_Verifly Web`), где стек
устоялся после 4-раундового консилиума Gemini↔GPT + бюджетных ограничений. Два
осознанных апгрейда относительно Verifly:

1. **Без CMS.** Verifly номинально выбрал Storyblok-1-seat, но по факту тоже сдал
   pure-static. RA — собственный продукт SF, редактирует команда через git. Контент в
   типизированных коллекциях → визуальный git-CMS (Decap/Sveltia) можно прикрутить позже
   без переписывания кода.
2. **Cloudflare Workers Static Assets** вместо Pages — go-forward платформа CF в 2026
   (официальный гайд «Migrate from Pages to Workers»). Позволяет бэкенду демо-формы жить
   в том же деплое, что и статика.

Бьёт в три цели: **скорость** (SSG + edge, ~0 KB baseline JS), **AI-SEO** (весь контент
в первом HTML — лучший случай для LLM/answer-engine краулеров), **low-ops** (нет CMS,
один деплой).

---

## Архитектура

```
reply-anywhere-dev/
├── STATUS.md            ← живой статус
├── docs/
│   ├── STACK.md         ← этот файл (решение)
│   └── PLAN.md          ← роадмап до запуска
├── BRIEF.md             ← клиентский бриф (source of truth по контенту)
├── index.html           ← dashboard-лаунчер (thin PREVIEW_CONFIG shell)
├── wireframe/ uikit/ shared/   ← исследовательская фаза (не прод)
└── site/                ← ПРОДАКШЕН-ЛЕНДИНГ (Astro)
    ├── astro.config.mjs        # SSG + sitemap + GSAP prebundle
    ├── wrangler.jsonc          # Workers Static Assets: main=worker, assets=./dist
    ├── worker/index.ts         # API-Worker: POST /api/demo
    ├── src/
    │   ├── content.config.ts   # типизированные коллекции (Zod)
    │   ├── data/landing.json    # копирайт (редактируется тут)
    │   ├── layouts/Layout.astro
    │   ├── components/{SEO,JsonLd,DemoForm}.astro
    │   ├── pages/{index,404}.astro + robots.txt.ts + llms.txt.ts
    │   └── styles/{tokens,global}.css
    └── public/{_headers,favicon.svg}
```

**Модель деплоя:** `wrangler deploy` грузит один Worker + `./dist` как ассеты. CF отдаёт
статику первой; Worker исполняется только на не-ассетных путях (`/api/*`). Одна команда,
один деплой, форма и сайт вместе.

---

## Что реализовано (проверено 2026-07-01)

| Слой | Статус | Файл |
|---|---|---|
| Astro SSG, build зелёный (587ms, zero JS baseline) | ✅ | `astro.config.mjs` |
| Самохостинг шрифта (Geist Variable, хешированный woff2) | ✅ (placeholder-шрифт) | `Layout.astro` |
| AI-crawler robots allow-list | ✅ | `pages/robots.txt.ts` |
| JSON-LD (SoftwareApplication + Organization) | ✅ | `components/JsonLd.astro` |
| `llms.txt` (карта сайта для AI-агентов) | ✅ | `pages/llms.txt.ts` |
| Демо-форма → API-Worker (валидация → Turnstile → доставка лида) | ✅ | `worker/index.ts`, `components/DemoForm.astro` |
| Cloudflare Turnstile (env-gated) | ✅ код, ⏳ ключи | `DemoForm.astro` + worker |
| CF Web Analytics (env-gated) | ✅ код, ⏳ токен | `Layout.astro` |
| Типизированные Content Collections | ✅ | `content.config.ts`, `data/landing.json` |
| `_headers` immutable-кэш + security | ✅ | `public/_headers` |

Тесты эндпоинтов (под `wrangler dev`): `GET /` 200 · `/llms.txt` ok · `/robots.txt` ok ·
`POST /api/demo` valid→`{ok:true}` · invalid email→`422` · wrong method→`405`.

---

## Контент-модель (без CMS)

Весь копирайт — в `src/data/landing.json`, валидируется Zod-схемой в `content.config.ts`,
отделён от разметки. Конвенция: `**слово**` в заголовке → акцентный span. Будущий
визуальный git-CMS (Decap/Sveltia) редактирует ровно эти файлы — прикручивается без
изменения кода.

## AI-SEO слой

robots.txt с явным allow-list под `OAI-SearchBot / ChatGPT-User / PerplexityBot /
Perplexity-User / Claude-SearchBot / Claude-User / Applebot / Googlebot` + JSON-LD entity
+ `llms.txt` + i18n-sitemap. Pure SSG = контент в первом HTML = лучший случай для
индексации AI-агентами (нечего «недорендерить»).

## Креды, нужные перед деплоем

В `site/.env.example`. Без них код работает (пропускает соответствующий шаг):
- `PUBLIC_TURNSTILE_SITEKEY` + `TURNSTILE_SECRET` — Turnstile (антиспам формы).
- `PUBLIC_CF_ANALYTICS_TOKEN` — CF Web Analytics.
- `LEAD_WEBHOOK_URL` — куда слать лиды (идеально — эндпоинт SF Omnichannel HelpDesk).

## Как запускать

```bash
cd site
npm install          # один раз
npm run dev          # UI-разработка → http://localhost:4321 (Worker НЕ запущен)
npm run cf:dev       # полный стек локально (assets + Worker) через wrangler
npm run build        # прод-сборка в ./dist (должна быть зелёной)
npm run deploy       # build + wrangler deploy (нужна авторизация CF)
```

## Заметки и нюансы

- **Шрифт Geist — placeholder.** Финальный шрифт задаётся дизайном (Figma), не выдуман.
- **Токены** (`src/styles/tokens.css`) — фиолетовые placeholder'ы; сверяются с
  Figma-переменными на этапе реализации, не изобретаются.
- **GSAP — island, не глобально.** Дефолт — нативные CSS scroll-driven анимации (0 JS);
  GSAP грузим только на секциях со сложной оркестровкой (лучше, чем глобальный GSAP у
  Verifly). GSAP предбандлен в `vite.optimizeDeps` (фикс 504-re-optimize).
- **Astro 6 (паритет с Verifly).** Astro 7 вышел — опциональный мажор, не блокер.
- **Dev-гоча:** добавление Content Collections в уже запущенный `astro dev` требует
  свежего процесса (`rm -rf site/.astro`) — на прод-билд не влияет.
