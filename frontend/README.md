# Frontend — Virgin Travel Studio

Next.js 16 (App Router, SSR) · React 19 · TypeScript strict · Tailwind CSS 4 · shadcn/ui · TanStack Query 5 · Zustand 5

## Три части приложения

Роут-группы в `app/`, каждая со своим лейаутом:

- **`(public)`** — `/`, `/tours`, `/tours/[id]`, `/tours/custom`, `/news`, `/about`, `/contacts` — публичная витрина. SSR, SEO-метаданные через `lib/seo.ts`, `robots.ts` и `sitemap.ts` генерируются Next.js.
- **`(auth)`** — страница входа персонала. Публичной ссылки на неё нет — доступ только по прямому URL.
- **`(dashboard)`** — `/admin/*` и `/manager/*` — CRM и CMS. Доступ по ролям из JWT; меню и возможности менеджера и админа различаются, но реальная проверка прав — на бэкенде.

## Структура

```
app/          роуты и лейауты (см. выше)
components/   UI: public/ (витрина), dashboard/ (CRM+CMS), shared/, ui/ (shadcn)
lib/          axiosApi, utils, seo, constants, hooks/ (TanStack Query), stores/ (Zustand)
services/     функции запросов к API — единственное место, где живёт axios
providers/    QueryClient и прочие провайдеры
types/        типы доменных сущностей
middleware/   защита dashboard-роутов
```

Поток данных: `services → lib/hooks → components`. Компоненты не ходят в axios напрямую — только через хуки.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `NEXT_API_URL` | базовый URL API для запросов |
| `NEXT_BACK_URL` | адрес бэкенда для rewrites (медиа, видео) |
| `NEXT_IMAGE_URL` | база для изображений из GridFS |
| `NEXT_PUBLIC_SITE_URL` | публичный адрес сайта (SEO, sitemap) |

## Скрипты

```bash
npm run dev        # dev-сервер, http://localhost:3000
npm run build      # production-сборка
npm run lint       # ESLint
npm run test       # Vitest в watch-режиме
npm run test:run   # разовый прогон
```

## Тесты

Vitest 4 + React Testing Library + jsdom. Тесты лежат рядом с кодом в `__tests__/`:
юнит-тесты утилит (`lib/__tests__`), тесты хуков с моками сервисов (`lib/hooks/__tests__`),
компонентные тесты форм, таблиц и карточек (`components/**/__tests__`).

Общий враппер для хуков — `lib/hooks/__tests__/testUtils.tsx` (свежий QueryClient, ретраи выключены).

## Конвенции

- Не нарушаем разделение слоёв (services → hooks → components) и структуру роут-групп.
- Коммиты: `type(scope): description` на английском, scope — `front`/`back`.
- Кажется, что что-то в архитектуре лишнее или устарело — сначала вопрос в чат команды, потом PR.