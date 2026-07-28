# Virgin Travel Studio

**Веб-платформа турагентства: витрина, CRM и CMS в одной системе.**
Командный выпускной проект ESDP (Attractor School) для реального заказчика — турагентства из Бишкека.

🌐 **Продакшн:** [virgintravelstudio.com](https://www.virgintravelstudio.com/)

---

## Что это

До проекта у заказчика был только Instagram: заказы терялись в директе, цены устаревали в постах, владелец не видел бизнес в цифрах. Платформа переводит бизнес в систему из трёх ролей:

| Роль | Что делает |
|---|---|
| **Клиент** | Каталог туров с фильтрами и поиском, живой счётчик свободных мест по заездам, бронирование, заявка на индивидуальный тур, новости, отзывы с фото |
| **Менеджер** | CRM: пул новых заявок, ведение по воронке из 5 статусов (`NEW → IN_PROGRESS → CONTRACT_PENDING → COMPLETED`, `REJECTED` — с обязательной причиной) |
| **Админ** | Все заявки + переназначение, управление менеджерами, CMS (туры, потоки, новости, категории, модерация отзывов, FAQ, настройки витрины), дашборд с выручкой, Excel-отчёты |

## Цифры

- **74** REST-эндпоинта, **12** сущностей MongoDB
- **1054** тест-кейса в 113 файлах (Vitest 4 + React Testing Library), покрытие ~71% строк
- CI на каждый pull request: lint → тесты → сборка; деплой — push в `main` → пересборка Docker-контейнеров на VPS

## Стек

**Frontend:** Next.js 16 (SSR) · React 19 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui · TanStack Query 5 · Zustand 5 · react-hook-form

**Backend:** Node.js 20 · Express 5 · Mongoose 9 · JWT + argon2id · Multer · Puppeteer (PDF-договоры) · ExcelJS (отчёты)

**Данные и инфраструктура:** MongoDB 7 (GridFS для медиа, aggregation pipeline, TTL-индексы) · Docker Compose · nginx + SSL · GitHub Actions · Contabo VPS

## Архитектура

```
Браузер → nginx (SSL, reverse proxy) → Next.js 16 (SSR)
                                          ↓ REST
                                       Express 5 API → MongoDB (Mongoose, GridFS)
```

Роль пользователя зашита в JWT и проверяется middleware (`auth` + `permit`) на каждом защищённом эндпоинте — разграничение доступа живёт на сервере, а не в интерфейсе.

## Быстрый старт

### Docker (рекомендуется)

```bash
git clone git@github.com:er-Bilim/virgin-travel-studio.git
cd virgin-travel-studio
docker compose up -d --build
```

Фронтенд — `http://localhost:3000`, API — `http://localhost:8000`.

### Локальная разработка

```bash
# MongoDB
docker compose up -d mongo

# Backend
cd backend
npm ci
npm run seed        # тестовые данные
npm run dev         # http://localhost:8000

# Frontend (отдельный терминал)
cd frontend
npm ci
npm run dev         # http://localhost:3000
```

### Тесты

```bash
cd frontend
npm run test:run
npm run lint
```

## Структура репозитория

```
frontend/   Next.js-приложение (витрина + CRM + CMS)
backend/    Express API, модели Mongoose, фикстуры
nginx/      конфигурация reverse proxy и SSL
.github/    CI/CD workflows
```

Подробнее об устройстве фронтенда — в [frontend/README.md](frontend/README.md).