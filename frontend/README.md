# Так. Тут у нас просто описание для всех. Не нарушайте архитектуру. Если что-то выглядит лишним или не нужным, пишите в тг группу!

## Три части приложения

Проект делится на три роута, каждая со своим лейаутом:

- `(public)` | `/`, `/tours`, `/news`, `/reviews` - Публичный сайт для клиентов 
- `(dashboard)` | `/admin/итд`, `/manager/итд` - CRM для админа и менеджеров 
- `twa` | `/twa/итд` - Telegram Web App внутри бота (Я не знаю правильно ли это или нет. Мб чуть позже исправим, когда узнаем что такое TWA)

---

## Структура папок

```
frontend/
├── app/                        # Роутинг (Next.js App Router)
│   ├── (public)/               # Публичный сайт
│   ├── (dashboard)/            # CRM панель
│   ├── twa/                    # Telegram Web App
│   └── layout.tsx              # КОРНЕВОЙ лейаут (html, body, шрифты)
│
├── components/                 # UI компоненты
│   ├── ui/                     # shadcn компоненты (не трогаем руками. Т.к shadcn вроде сам создает компоненты туда куда нужно) 
│   ├── shared/                 # Общие компоненты (используются везде)
│   ├── public/                 # Только для публичного сайта
│   └── dashboard/              # Только для CRM. Важно!. Если что-то добавим, продолжаем в таком же порядке!
│
├── lib/                        # Утилиты и логика
│   ├── axiosApi.ts             # Axios инстанс и базовые запросы
│   ├── constants.ts            # Константы проекта
│   ├── utils.ts                # Вспомогательные функции
│   └── hooks/                  # Кастомные React хуки
│
├── types/                      # TypeScript интерфейсы
├── store/                      # Zustand сторы
│   ├── auth/
│   │
│   ├── tours/
│   │   ├── toursStore.ts       # стейт
│   │   └── toursActions.ts     # можно выносит запросы в такие файлы.
└── middleware/                 # Защита роутов (auth, roles)
```

---

## app/ - роутинг

### Почему скобки в `(public)` и `(dashboard)`

Скобки это **route groups** в Next.js. Папка в скобках не попадает в URL:

```
app/(public)/tours/page.tsx   →  /tours Это ок ок
app/(dashboard)/admin/page.tsx →  /admin Это ок ок
```

**роут не будет public/tours/. Он будет без public -> /tours**


Без скобок URL был бы `/public/tours` и `/dashboard/admin`

### Лейауты

Каждая папка или роут имеет свой `layout.tsx`:

- `app/layout.tsx` - единственный где есть `<html>` и `<body>`. Подключает шрифты, глобальные стили, Toaster
- `(public)/layout.tsx` - добавляет Header и Footer вокруг всех публичных страниц
- `(dashboard)/layout.tsx` - добавляет Sidebar для CRM
- `twa/layout.tsx` - подключает Telegram SDK

Цепочка рендера выглядит так:

```
app/layout.tsx
└── (public)/layout.tsx
    └── tours/page.tsx
```

### Страницы CRM

```
(dashboard)/
├── admin/                      # Доступно только администратору
│   ├── page.tsx                # Статистика
│   ├── managers/               # Управление менеджерами
│   └── settings/               # Логотип, соцсети, адрес офиса
│
└── manager/                    # Доступно менеджерам
    ├── page.tsx                # Активные заявки
    ├── clients/                # База клиентов
    ├── orders/                 # Заявки
    ├── tours/                  # Туры и наборы (группы)
    ├── reports/                # Отчёты, выгрузка Excel
    └── news/                   # Новости и полезная информация
```

Вложенность туров: `tours/[id]/groups/[groupId]` - набор всегда принадлежит туру, поэтому они вложены

---

## components/ - компоненты

### Правило: куда класть компонент?

*где этот компонент используется?*

- Только на публичном сайте -> `components/public/`
- Только в CRM -> `components/dashboard/`
- В обоих местах -> `components/shared/`
- Это shadcn компонент -> `components/ui/` (не редактируем по возможности т.к стили могут сбросится если мы попытаемя снова создать тот же компонент. Так как shadcn вроде сам создает компонент со стилями. Перезапишет!)

### Примеры

```
components/
├── ui/
│   ├── button.tsx              # shadcn - не трогаем
│   └── sonner.tsx              # shadcn - не трогаем
│
├── shared/
│   ├── TourCard.tsx            # Карточка тура (используется и на сайте и в CRM) - это всё просто примеры. Их сейчас нет!
│   
│   
│
├── public/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── home/                   # Секции главной страницы
│   │   
│   │   
│   │ 
│   └── tours/
│       
│      
│
└── dashboard/
    ├── layout/
    │   ├── Sidebar.tsx
    │   └── TopBar.tsx
    ├── clients/
    │   
    │   
    ├── orders/
    │   
    │   
    │   
    └── tours/
        ├── TourForm.tsx - пример
```

---

## lib/ - утилиты и хуки

### axiosApi.ts

Axios инстанс с baseURL и интерцепторами. Все запросы к API делаются через него

### hooks/

Если не будем использовать удалим. Но она очень хорошо сочетается с zustand или tanstack. Просто на будущее

---

## types/ - TypeScript типы

## Важные правила

**Не редактируем (если можно) `components/ui/`** - сам shadcn создает. При обновлении перезапишется
**Типы только в `types/`**
**Компонент кладём туда, где используется** - public / dashboard / shared