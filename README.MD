# Musician App — Backend

REST API для трекера изучения музыкального материала. Часть проекта **Musician App** — приложения для артистов (музыкантов, чтецов, исполнителей) для отслеживания репертуара: песен, стихов, инструментальных произведений.

Фронтенд — отдельный репозиторий (Angular SPA).

## Что делает

- **Аутентификация** — JWT, роли (admin/user), bcrypt-хеширование паролей.
- **Управление треками** — CRUD, пагинация, разбивка текста на фрагменты.
- **Прогресс изучения** — вычисляется из фрагментов, не хранится.
- **Комментарии** — привязка к диапазону текста (аннотации в стиле Genius), к треку, к тегу.
- **Теги** — глобальные, с описанием, привязка к трекам и фрагментам.
- **Профили** — displayName отдельно от credentials.

## Технологический стек

| Слой | Технология |
|------|-----------|
| Runtime | Node.js 20+ (24 LTS рекомендуется) |
| Язык | TypeScript 5.x (strict mode) |
| HTTP | Express 5.x |
| Auth | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| Persistence | JSON-файлы на диске (MVP, планируется переход на SQLite/PostgreSQL) |
| DI | Ручной через composition root |
| Dev runner | `tsx` |
| Сборка | `tsc` |

## Архитектура

Проект следует **Clean Architecture** (Robert C. Martin) с элементами **DDD** и **ООП**.

### Слои и направление зависимостей

```
┌────────────────────────────────────────┐
│  Infrastructure (Frameworks & Drivers) │  Express, JSON, JWT, bcrypt
├────────────────────────────────────────┤
│  Presentation (Interface Adapters)     │  Controllers, Routes
├────────────────────────────────────────┤
│  Application (Use Cases)               │  Orchestrators, Use Cases
├────────────────────────────────────────┤
│  Domain (Entities)                     │  Entities, Ports, Value Objects
└────────────────────────────────────────┘
              ↑
    Зависимости идут только внутрь
```

**Правило:** `domain` не зависит ни от чего, кроме себя. `application` зависит от `domain`. `presentation` — от `application` и `domain`. `infrastructure` — от всех, но никто не зависит от неё.

### Структура проекта

```
src/
├── domain/                    ← Entities, Ports
│   ├── user.ts
│   ├── tracked-item.ts
│   ├── tracked-item-fragment.ts
│   ├── fragment-list.ts
│   ├── reviewed-at.ts
│   ├── comment.ts
│   ├── hash-tag.ts
│   ├── tag-link.ts
│   ├── types/
│   └── ports/                 ← Интерфейсы репозиториев и сервисов
│
├── application/               ← Use Cases + Orchestrators
│   ├── main-orchestrator.ts
│   ├── comments-orchestrator.ts
│   ├── tags-orchestrator.ts
│   └── use-cases/
│
├── presentation/              ← Controllers
│   └── controllers/
│
├── infrastructure/            ← Frameworks & Drivers
│   ├── express/
│   ├── *-repo.ts              ← JSON-реализации портов
│   ├── bcrypt-password-hasher.ts
│   ├── jwt-token-provider.ts
│   └── unique-id-generator.ts
│
├── bootstrap/
│   └── container.ts           ← Composition root
│
└── main.ts                    ← Entry point
```

## Домен

### Сущности

#### `User`

Минимальная сущность — идентичность и роль. `email`, `passwordHash`, `displayName` — вне домена.

```typescript
class User {
    readonly id: TUniqueId;
    private role: 'admin' | 'user';
    private status: 'active' | 'blocked';
    readonly createdAt: number;
}
```

**Разделение по слоям:**
- `User` (domain) — id, role, status, createdAt.
- `ICredentialsRepo` — email + passwordHash, поиск по email.
- `IUserProfilesRepo` — displayName (уникальный).

Паттерн **Identity vs Profile** (как в Auth0, Keycloak): credentials и публичный профиль меняются независимо от идентичности.

#### `TrackedItem`

Сущность «трек» — песня, стих, инструментал.

```typescript
class TrackedItem {
    readonly id: TUniqueId;
    private artistName: string;
    private title: string;
    private fragments: FragmentList;
}
```

Прогресс **не хранится** — вычисляется из фрагментов:

```typescript
calculateProgress(): number {
    const { total, completed } = this.fragments.getCompletionSummary();
    return total > 0 ? (completed / total) * 100 : 0;
}
```

Прогресс — производная от `isDone` фрагментов. Хранить его — два источника правды, риск рассинхрона.

#### `TrackedItemTextFragment`

Кусок текста (куплет, припев, строфа).

```typescript
class TrackedItemTextFragment {
    readonly id: TUniqueId;
    private text: string;
    private title: string;
    private isDone: boolean;
    private lastReviewedAt: ReviewedAt | null;
}
```

**`id` обязателен** — комментарии и теги ссылаются на фрагмент по `id`, не по индексу. Защита от съезда ссылок при удалении/вставке.

#### `Comment`

Привязан к цели через **discriminated union**.

```typescript
type TCommentTarget =
    | { type: 'fragment-range'; trackedItemId: string; fragmentId: string; start: number; end: number; quote: string }
    | { type: 'tag'; tagId: string }
    | { type: 'tracked-item'; trackedItemId: string };

class Comment {
    readonly id: TUniqueId;
    private text: string;
    readonly target: TCommentTarget;
    readonly authorId: TUniqueId;
    readonly createdAt: number;
}
```

Разные типы цели — разные поля. Компилятор не даёт создать «невозможное» состояние (тег с диапазоном).

#### `HashTag` и `TagLink`

```typescript
class HashTag {
    readonly id: TUniqueId;
    readonly originalText: string;       // «Припев» — как ввёл автор
    readonly normalizedText: string;     // «припев» — для поиска и дедупликации
    private description: string;         // «что значит этот тег»
    readonly createdBy: TUniqueId;       // только автор может править описание
}

class TagLink {
    readonly id: TUniqueId;
    readonly tagId: TUniqueId;
    readonly target: TTagLinkTarget;
    readonly createdAt: number;
}
```

Один тег — много привязок. Нормализация: `trim().toLowerCase()`. Пробел — разделитель (один ввод = несколько тегов).

## API

Все роуты, кроме `/api/health` и `/api/auth/*`, защищены JWT (`Authorization: Bearer <token>`).

### Auth

| Метод | Путь | Назначение |
|-------|------|-----------|
| `POST` | `/api/auth/login` | Вход. Body: `{ email, password }` |
| `POST` | `/api/auth/register` | Регистрация. Body: `{ email, password, displayName }` |

### Tracked Items

| Метод | Путь | Назначение |
|-------|------|-----------|
| `GET` | `/api/tracked-items?page=1&limit=20` | Список с пагинацией |
| `GET` | `/api/tracked-items/:id` | Карточка с фрагментами |
| `POST` | `/api/tracked-items` | Создать |
| `PUT` | `/api/tracked-items/:id` | Обновить `artistName`/`title` |
| `DELETE` | `/api/tracked-items/:id` | Удалить (каскадно) |
| `POST` | `/api/tracked-items/:id/fragments` | Добавить фрагмент |
| `DELETE` | `/api/tracked-items/:id/fragments/:fragmentId` | Удалить фрагмент |
| `PATCH` | `/api/tracked-items/:id/fragments/:fragmentId/done` | Toggle `isDone` |
| `PATCH` | `/api/tracked-items/:id/fragments/:fragmentId/review` | Отметить повторение |
| `PATCH` | `/api/tracked-items/:id/fragments/:fragmentId` | Обновить фрагмент |

### Comments

| Метод | Путь | Назначение |
|-------|------|-----------|
| `GET` | `/api/comments?trackedItemId=...` | Все комментарии трека |
| `POST` | `/api/comments/by-target` | По конкретному target |
| `POST` | `/api/comments` | Создать (`authorId` из токена) |
| `PATCH` | `/api/comments/:id` | Обновить текст |
| `DELETE` | `/api/comments/:id` | Удалить (каскадно) |

### Tags

| Метод | Путь | Назначение |
|-------|------|-----------|
| `GET` | `/api/tags` | Все теги |
| `POST` | `/api/tags/for-target` | Теги для цели |
| `GET` | `/api/tags/for-tracked-item/:id` | Все теги трека и фрагментов (batch, без N+1) |
| `POST` | `/api/tags/link` | Привязать тег |
| `POST` | `/api/tags/link/remove` | Отвязать |
| `GET` | `/api/tags/:id/targets` | Где используется тег |
| `PATCH` | `/api/tags/:id/description` | Обновить описание (только автор) |
| `DELETE` | `/api/tags/:id` | Удалить тег (каскадно) |

### Profiles

| Метод | Путь | Назначение |
|-------|------|-----------|
| `POST` | `/api/profiles/batch` | Имена пользователей по ids |

## Ключевые технические решения

### 1. JWT-аутентификация

`jwt-sign` с секретом из `.env`, `expiresIn: 7d`. `authMiddleware` проверяет `Authorization: Bearer`, декодирует, кладёт `userId` в `req`. Контроллеры берут `authorId` оттуда — клиент не может подделать.

### 2. Каскадное удаление

`MainOrchestrator.delete(id)`:
1. `commentsRepo.deleteByTrackedItem(id)` — все комментарии к треку и фрагментам.
2. `tagLinksRepo.deleteByTrackedItem(id)` — все связи.
3. `itemsListRepo.removeOne(id)` — сам трек.

Аналогично при удалении фрагмента, комментария, тега. Без транзакций в JSON-репозиториях — риск рассинхрона при падении посередине. Для MVP приемлемо. В БД решается `BEGIN/COMMIT`.

### 3. Fragment ID вместо индекса

Изначально комментарии и теги ссылались на фрагмент по `fragmentIndex`. При удалении фрагмента индексы съезжали — ссылки становились невалидными. Рефакторинг ввёл стабильный `id`. Все `target` теперь ссылаются на `fragmentId`.

### 4. Composition root

`bootstrap/container.ts` — единственное место, где создаются конкретные реализации и связываются с портами. Ни контроллеры, ни use case'ы не создают зависимости сами. Ручной DI без фреймворка.

### 5. Seed через оркестратор

При первом запуске (`usersRepo.count() === 0`) создаётся admin из `.env`. Seed треков идёт через `orchestrator.create(...)` — чтобы `id` фрагментов генерировались корректно.

## Локальный запуск

### Требования

- Node.js 20+ (24 LTS рекомендуется)
- npm 10+
- Git

### Установка

```bash
git clone <repo-url>
cd music-business
npm install
```

### `.env`

Создай `.env` в корне проекта:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-to-strong-password
ADMIN_DISPLAYNAME=Admin
JWT_SECRET=generate-with-openssl-rand-hex-32
JWT_EXPIRES_IN=7d
```

**Для генерации `JWT_SECRET`:**

```bash
openssl rand -hex 32
```

**Не коммить `.env` в git.** Он в `.gitignore`.

### Запуск

```bash
npm run dev
```

Сервер на `http://localhost:3000`. Seed создаст admin (из `.env`) и 4 демо-трека.

### Сборка для продакшена

```bash
npm run build
npm start
```

## Скрипты

| Скрипт | Что делает |
|--------|-----------|
| `npm run dev` | Dev-сервер с `tsx` (без сборки) |
| `npm run build` | Компиляция TypeScript в `dist/` |
| `npm start` | Запуск собранного `dist/main.js` |
| `npx tsc --noEmit` | Проверка типов без сборки |

## Статус проекта

**MVP в активной разработке.** Реализовано:

- ✅ Аутентификация (JWT, роли, bcrypt)
- ✅ CRUD треков с фрагментами
- ✅ Прогресс изучения (вычисляется из фрагментов)
- ✅ Пагинация
- ✅ Комментарии с привязкой к диапазону текста
- ✅ Теги с описанием (глобальные)
- ✅ Разделение ролей (admin/user)
- ✅ Профили пользователей

**Планируется:**
- Переход с JSON на SQLite (production-ready persistence)
- Spaced repetition (`nextReviewAt`, `interval`, `repetitions`)
- Регистрация на фронтенде (API готов)
- Поиск и фильтры
- Импорт/экспорт данных
- Медиа (аудио, видео, аккорды, ноты)

## Соглашения по коду

### Коммиты

Формат: `<тип>: <короткое описание в императиве>`.

- `feat:` — новая функциональность
- `fix:` — исправление бага
- `refactor:` — рефакторинг
- `chore:` — рутина
- `docs:` — документация

### Git-flow

- `main` — стабильная ветка
- `feature/<name>` — фичи, мержатся в `main` после готовности
- Один коммит — одна логическая единица

### Архитектурные правила

- Домен не зависит от инфраструктуры. Никаких импортов из `infrastructure` в `domain`.
- Порты — в `domain`. Реализации — в `infrastructure`.
- Use cases — тонкие. Вся валидация и инварианты — в домене или на бэке.
- Композиция — в `bootstrap/container.ts`. Единственное место создания реализаций.
- Никаких `new` в use case'ах. Зависимости через конструктор.
- `fragmentId` вместо индекса во всех ссылках на фрагменты.

## Лицензия

Private project. All rights reserved.
