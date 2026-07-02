# Reply Anywhere — STATUS

> Живой указатель «где мы сейчас». Решение по стеку — [`docs/STACK.md`](docs/STACK.md);
> план до запуска — [`docs/PLAN.md`](docs/PLAN.md) · Спеки анимаций:
> [`docs/HERO-MOTION-SPEC.md`](docs/HERO-MOTION-SPEC.md), [`docs/SCROLL-SCENE-SPEC.md`](docs/SCROLL-SCENE-SPEC.md)
> · Планка: [`docs/QUALITY-BAR.md`](docs/QUALITY-BAR.md).

**Обновлено:** 2026-07-02, ~01:15 (ночная сессия завершена)
**Фаза:** **DEMO-READY** ✅ — лонгрид собран, все 6 секций прошли оверлей-QA
«до нуля отличий», все 4 анимационные системы работают (hero-оркестр: орбиты +
рельсы/импульсы + typewriter-слово; pinned-сцена «One platform» в 4 бита;
marquee), финальная интеграционная QA чистая (консоль 0 ошибок, overflow нет,
фон непрерывен, reduced-motion ок). Прод-билд зелёный (1.87s, 8 страниц).
**Демо:** локально `cd site && npm run dev` → http://localhost:4321 (превью
секций: `/preview/hero|menu|…`). Скрин-пруфы: `scratchpad/qa-screens-final/`.
**Нужны решения Олега (Figma-верные, но подозрительные):** 1) опечатка
«responces» — она в самом макете (2 места); 2) категория WhatsApp-пилла
«Less manual work» (у остальных — категории каналов). Править в Figma + коде
вместе. Публичный URL — по команде (`npm run deploy`, нужен wrangler-auth).
**Разделение труда:** Олег = дизайн в Figma · Claude = инжиниринг (Figma→код),
автономные perfection-циклы.

---

## Где мы

- ✅ **Фундамент построен и проверен** — Astro SSG + CF Workers Static Assets + AI-SEO
  слой + демо-форма на Worker + типизированный контент. Билд зелёный, тесты эндпоинтов
  проходят. Детали — `docs/STACK.md`.
- ⬅ **Сейчас:** ждём Figma-дизайн, чтобы перейти к реализации секций (Phase 2).

## Сделано (Phase 0)

- Astro 6 pure SSG, build 587ms, ~0 KB baseline JS.
- AI-crawler robots allow-list + JSON-LD + `llms.txt` + sitemap.
- Демо-форма → API-Worker `/api/demo` (валидация + Turnstile + доставка лида), в одном
  деплое со статикой (Workers Static Assets).
- Content Collections (копирайт в `site/data/landing.json`, Zod-типы).
- CF Web Analytics + Turnstile — код готов, env-gated (ждут ключей).

## Следующее действие

- 🟣 **Олег:** прислать ссылку на Figma-файл/фреймы + ассеты Ajax (скрины, логотипы).
- 🔵 **Claude:** по ссылке — вытянуть дизайн через Figma MCP и собрать секции в `site/`.

## Нужно от клиента

- **Ссылка на Figma** (desktop + mobile).
- Скрины продукта от **Ajax** + логотипы (Ajax, Samsung, Volia).
- Перед деплоем: CF-креды (Turnstile ключи, Web Analytics токен, `LEAD_WEBHOOK_URL`).

## Ссылки

- **Локальное превью:** http://localhost:4321 (`cd site && npm run dev`)
- **Репозиторий:** `chife-mod/reply-anywhere`
- **Прод:** появится после первого `npm run deploy` (Worker `reply-anywhere`)
