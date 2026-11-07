# Musician App — трекер изучения музыкального материала

## О проекте

**Musician App** — личное приложение для артиста (музыканта, чтеца, исполнителя) для отслеживания процесса изучения музыкального материала: песен, стихов, инструментальных произведений.

### Зачем это нужно

Артист работает с репертуаром: десятки песен и стихов, каждый в разной степени готовности. Нужен инструмент, который:

- **Хранит тексты** песен, стихов, инструментальных произведений.
- **Разбивает текст на фрагменты** (куплеты, припевы, строфы) для пошагового изучения.
- **Отслеживает прогресс** каждого фрагмента: выучен / не выучен / давно не повторялся.
- **Позволяет аннотировать** любой кусок текста — комментарий к конкретным строкам, а не ко всему фрагменту.
- **Помечает** материал тегами: `#припев`, `#сложное-место`, `#интересный-оборот-речи`. С описанием, что тег значит.
- **Готов к коллаборации**: пользователи с ролями, совместная работа над общим репертуаром.

### Что уже реализовано

- ✅ Аутентификация (JWT, admin seed)
- ✅ CRUD треков с фрагментами
- ✅ Прогресс изучения (вычисляется из фрагментов)
- ✅ Пагинация списка
- ✅ Комментарии к диапазону текста с подсветкой аннотаций
- ✅ Теги с описанием (глобальные, привязка к треку и фрагменту)
- ✅ Разделение ролей (admin/user)
- ✅ Профили пользователей (displayName отдельно от credentials)

### Что запланировано, но не реализовано

- ⏳ Регистрация на фронте (API готов, UI нет)
- ⏳ Редактирование существующих комментариев (сейчас только создать/удалить)
- ⏳ Фильтр по тегам («показать все треки с #припев»)
- ⏳ Поиск по тексту и названиям
- ⏳ Spaced repetition (интервальное повторение) — сейчас только `lastReviewedAt` без расчёта следующего повторения
- ⏳ Аспекты изучения (текст/музыка/подача как отдельные оси прогресса)
- ⏳ Split/merge фрагментов в UI (в домене методы есть, UI нет)
- ⏳ Импорт/экспорт данных
- ⏳ Медиа (аудио, видео, аккорды, ноты)
- ⏳ Уведомления и напоминания
- ⏳ Тёмная тема (палитра проработана, но не применена)

---

## Технологический стек

### Бэкенд

| Слой | Технология |
|------|-----------|
| Runtime | Node.js 24 LTS |
| Язык | TypeScript 5.x (strict mode) |
| HTTP | Express 5.x |
| Auth | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| Persistence | JSON-файлы на диске (MVP, без БД) |
| DI | Ручной через composition root |
| Dev runner | `tsx` |
| Сборка | `tsc` |

### Фронтенд

| Слой | Технология |
|------|-----------|
| Framework | Angular 22 (standalone components) |
| Язык | TypeScript 5.x (strict mode) |
| UI Kit | PrimeNG 22 (`Aura` theme) |
| State | Angular Signals |
| HTTP | `HttpClient` + RxJS (`firstValueFrom`) |
| Reactive API | CSS Custom Highlight API (для аннотаций) |
| Build | Angular CLI (`ng build -c production`) |

### Инфраструктура (деплой)

| Компонент | Решение |
|-----------|---------|
| ОС | Ubuntu 24.04 LTS |
| VPS | 1 GB RAM, 14 GB SSD, swap 1 GB |
| Web server | Nginx 1.24 (reverse proxy + статика) |
| Process manager | PM2 7.x |
| Публичный адрес | `http://185.11.135.200:8080` (порт 80 занят другим приложением) |

---

## Архитектура

Проект строго следует **Clean Architecture** (Robert C. Martin) с элементами **DDD** (Domain-Driven Design) и **ООП** на бэкенде.

### Слои и направление зависимостей

```
┌─────────────────────────────────────┐
│  Infrastructure (Frameworks & Drivers) │  Express, JSON, JWT, bcrypt
├─────────────────────────────────────┤
│  Presentation (Interface Adapters)    │  Controllers, Routes
├─────────────────────────────────────┤
│  Application (Use Cases)              │  Orchestrators, Use Cases
├─────────────────────────────────────┤
│  Domain (Entities)                    │  Entities, Ports, Value Objects
└─────────────────────────────────────┘
              ↑
    Зависимости идут только внутрь
```

**Правило:** `domain` не зависит ни от чего, кроме себя. `application` зависит от `domain`. `presentation` — от `application` и `domain`. `infrastructure` — от всех, но никто не зависит от неё.

### Бэкенд — структура

```
music-business/
├── src/
│   ├── domain/                        ← Entities, Ports
│   │   ├── user.ts                    User (id, role, status, createdAt)
│   │   ├── tracked-item.ts            TrackedItem (id, artistName, title, fragments)
│   │   ├── tracked-item-fragment.ts   TrackedItemTextFragment (id, text, title, isDone, lastReviewedAt)
│   │   ├── fragment-list.ts           FragmentList (value object для массива фрагментов)
│   │   ├── reviewed-at.ts             ReviewedAt (value object для timestamp)
│   │   ├── comment.ts                 Comment (id, text, target, authorId, createdAt)
│   │   ├── hash-tag.ts                HashTag (id, originalText, normalizedText, description, createdBy)
│   │   ├── tag-link.ts                TagLink (id, tagId, target, createdAt)
│   │   ├── types/                     Общие типы (TUniqueId, TWithId)
│   │   └── ports/                     Интерфейсы репозиториев и сервисов
│   │       ├── tracked-items-list-repo.ts
│   │       ├── comments-repo.ts
│   │       ├── tags-repo.ts
│   │       ├── tag-links-repo.ts
│   │       ├── users-repo.ts
│   │       ├── credentials-repo.ts
│   │       ├── user-profiles-repo.ts
│   │       ├── password-hasher.ts
│   │       ├── token-provider.ts
│   │       └── uniqueIdGenerator.ts
│   │
│   ├── application/                   ← Use Cases + Orchestrators
│   │   ├── main-orchestrator.ts       Фасад над треками и фрагментами
│   │   ├── comments-orchestrator.ts   Фасад над комментариями
│   │   ├── tags-orchestrator.ts       Фасад над тегами
│   │   └── use-cases/
│   │       ├── toggle-fragment-use-case.ts
│   │       ├── auth/                  register-user, login-user
│   │       ├── comments/              add, update, delete, get
│   │       └── tags/                  add, remove, delete, get, update-description
│   │
│   ├── presentation/                  ← Controllers
│   │   └── controllers/
│   │       ├── tracked-items-list.controller.ts
│   │       ├── comments.controller.ts
│   │       ├── tags.controller.ts
│   │       ├── auth.controller.ts
│   │       └── profiles.controller.ts
│   │
│   ├── infrastructure/                ← Frameworks & Drivers
│   │   ├── express/
│   │   │   ├── app.ts                 Создание Express-приложения
│   │   │   ├── middleware/auth.middleware.ts
│   │   │   └── routes/*.routes.ts
│   │   ├── tracked-items-list-repo.ts JSON-реализация
│   │   ├── comments-repo.ts
│   │   ├── tags-repo.ts
│   │   ├── tag-links-repo.ts
│   │   ├── users-repo.ts
│   │   ├── credentials-repo.ts
│   │   ├── user-profiles-repo.ts
│   │   ├── bcrypt-password-hasher.ts
│   │   ├── jwt-token-provider.ts
│   │   ├── unique-id-generator.ts
│   │   └── targets-equal.ts
│   │
│   ├── bootstrap/
│   │   └── container.ts               Composition root — сборка графа зависимостей
│   │
│   ├── loop.ts                        Песочница для фоновых задач (пока пустая)
│   └── main.ts                        Entry point — bootstrap + app.listen
│
├── data/                              JSON-файлы (не коммитятся в git)
│   ├── tracked-items.json
│   ├── comments.json
│   ├── tags.json
│   ├── tag-links.json
│   ├── users.json
│   ├── credentials.json
│   └── profiles.json
│
├── .env                               Секреты (не коммитится)
├── .env.example                       Шаблон
├── tsconfig.json
└── package.json
```

### Фронтенд — структура

```
musician-app/
├── src/
│   └── app/
│       ├── domain/                    ← Entities, Ports
│       │   ├── tracked-item/
│       │   │   ├── models/            TrackedItem, TrackedItemTextFragment
│       │   │   └── ports/             TrackedItemRepositoryPort
│       │   ├── comment/
│       │   │   ├── models/            Comment (interface), TCommentTarget
│       │   │   └── ports/             CommentsRepositoryPort
│       │   ├── tag/
│       │   │   ├── models/            HashTag, TagLink
│       │   │   └── ports/             TagsRepositoryPort
│       │   ├── user/
│       │   │   └── ports/             UserProfilesRepositoryPort
│       │   └── auth/
│       │       ├── models/            IAuthUser, ILoginResult
│       │       └── ports/             AuthRepositoryPort
│       │
│       ├── application/               ← Use Cases
│       │   ├── tracked-item/use-cases/
│       │   ├── comment/use-cases/
│       │   ├── tag/use-cases/
│       │   └── auth/use-cases/
│       │
│       ├── infrastructure/            ← Реализации портов
│       │   ├── tracked-item/
│       │   │   ├── http-tracked-item.repository.ts
│       │   │   └── tracked-item.dto.ts
│       │   ├── comment/
│       │   ├── tag/
│       │   ├── user/
│       │   └── auth/
│       │       ├── http-auth.repository.ts
│       │       ├── auth.dto.ts
│       │       └── auth.interceptor.ts
│       │
│       ├── presentation/              ← Компоненты
│       │   ├── tracked-item-list/
│       │   ├── tracked-item-detail/
│       │   │   └── fragment-card/
│       │   ├── tracked-item-form/
│       │   ├── login/
│       │   └── shared/
│       │       └── tag-chips/
│       │
│       ├── core/                      ← Angular-специфика (не CA-слой)
│       │   ├── services/              AuthService, SelectionService, AnnotationHighlighterService
│       │   ├── tokens/                InjectionToken для DI
│       │   └── guards/                authGuard
│       │
│       ├── app.config.ts              DI-провайдеры
│       ├── app.routes.ts              Маршруты с lazy loading
│       └── app.component.ts           Корневой компонент
│
├── dist/                              Production build (не коммитится)
├── angular.json
├── proxy.conf.json                    Прокси на бэк в dev-режиме
└── package.json
```

---

## Домен

### Сущности

#### `User` (domain/user.ts)

Минимальная сущность — только идентичность и роль. `email`, `passwordHash`, `displayName` — вне домена.

```typescript
class User {
    readonly id: TUniqueId;
    private role: 'admin' | 'user';
    private status: 'active' | 'blocked';
    readonly createdAt: number;
}
```

**Разделение (по слоям):**
- `User` (domain) — id, role, status, createdAt.
- `ICredentialsRepo` (infrastructure) — email + passwordHash, поиск по email.
- `IUserProfilesRepo` (infrastructure) — displayName (уникальный), поиск по имени.

**Почему так:** email и пароль — credentials, не свойства пользователя. DisplayName — публичный профиль, может меняться независимо от идентичности. Это паттерн **Identity vs Profile** (как в Auth0, Keycloak).

#### `TrackedItem` (domain/tracked-item.ts)

Сущность «трек» — песня, стих, инструментал.

```typescript
class TrackedItem {
    readonly id: TUniqueId;
    private artistName: string;
    private title: string;
    private fragments: FragmentList;
}
```

**Прогресс не хранится** — вычисляется из фрагментов:

```typescript
calculateProgress(): number {
    const { total, completed } = this.fragments.getCompletionSummary();
    return total > 0 ? (completed / total) * 100 : 0;
}
```

**Почему:** прогресс — производная от `isDone` фрагментов. Хранить его в JSON — два источника правды, риск рассинхрона.

#### `TrackedItemTextFragment` (domain/tracked-item-fragment.ts)

Кусок текста (куплет, припев, строфа).

```typescript
class TrackedItemTextFragment {
    readonly id: TUniqueId;              // стабильный id для ссылок извне
    private text: string;
    private title: string;               // опциональное название («Куплет 1»)
    private isDone: boolean;
    private lastReviewedAt: ReviewedAt | null;  // value object
}
```

**Ключевое:** `id` **обязателен** — комментарии и теги ссылаются на фрагмент по `id`, не по индексу. Это защита от съезда ссылок при удалении/вставке фрагментов.

#### `Comment` (domain/comment.ts)

Комментарий, привязанный к цели через **discriminated union**.

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

**Почему discriminated union:** разные типы цели имеют разные поля. Компилятор не даёт создать «невозможное» состояние (тег с диапазоном).

**Инвариант:** для `fragment-range` — `start < end`. Проверяется в конструкторе.

#### `HashTag` (domain/hash-tag.ts)

Глобальный тег. Один тег — много привязок через `TagLink`.

```typescript
class HashTag {
    readonly id: TUniqueId;
    readonly originalText: string;       // «Припев» — как ввёл автор
    readonly normalizedText: string;     // «припев» — для поиска и дедупликации
    private description: string;         // «что значит этот тег»
    readonly createdBy: TUniqueId;       // только автор может править описание
}
```

**Нормализация:** `trim().toLowerCase()`. Пробел — разделитель (один ввод = несколько тегов). Дефис/подчёркивание — часть тега.

#### `TagLink` (domain/tag-link.ts)

Связь тега с целью. Иммутабельная — удалить можно, изменить нельзя.

```typescript
type TTagLinkTarget =
    | { type: 'tracked-item'; trackedItemId: string }
    | { type: 'fragment'; trackedItemId: string; fragmentId: string }
    | { type: 'comment'; commentId: string };

class TagLink {
    readonly id: TUniqueId;
    readonly tagId: TUniqueId;
    readonly target: TTagLinkTarget;
    readonly createdAt: number;
}
```

**Денормализация `trackedItemId` в target фрагмента** — для быстрого запроса «все теги трека» без N+1.

---

## API

Все роуты, кроме `/api/health` и `/api/auth/*`, защищены JWT (заголовок `Authorization: Bearer <token>`).

### Auth

| Метод | Путь | Назначение |
|-------|------|-----------|
| `POST` | `/api/auth/login` | Вход. Body: `{ email, password }`. Возвращает `{ token, user }` |
| `POST` | `/api/auth/register` | Регистрация. Body: `{ email, password, displayName }` |

### Tracked Items

| Метод | Путь | Назначение |
|-------|------|-----------|
| `GET` | `/api/tracked-items?page=1&limit=20` | Список с пагинацией. Возвращает `{ items, total, page, limit }` |
| `GET` | `/api/tracked-items/:id` | Карточка с фрагментами |
| `POST` | `/api/tracked-items` | Создать. Body: `{ artistName, title, fragments: [...] }` |
| `PUT` | `/api/tracked-items/:id` | Обновить `artistName`/`title` |
| `DELETE` | `/api/tracked-items/:id` | Удалить (каскадно: комментарии, tag-links) |
| `POST` | `/api/tracked-items/:id/fragments` | Добавить фрагмент |
| `DELETE` | `/api/tracked-items/:id/fragments/:fragmentId` | Удалить фрагмент |
| `PATCH` | `/api/tracked-items/:id/fragments/:fragmentId/done` | Toggle isDone. Body: `{ done }` |
| `PATCH` | `/api/tracked-items/:id/fragments/:fragmentId/review` | Отметить повторение (`lastReviewedAt = now`) |
| `PATCH` | `/api/tracked-items/:id/fragments/:fragmentId` | Обновить text/title фрагмента |

### Comments

| Метод | Путь | Назначение |
|-------|------|-----------|
| `GET` | `/api/comments?trackedItemId=...` | Все комментарии трека |
| `POST` | `/api/comments/by-target` | По конкретному target (body: `{ target }`) |
| `POST` | `/api/comments` | Создать (body: `{ text, target }`, `authorId` из токена) |
| `PATCH` | `/api/comments/:id` | Обновить текст |
| `DELETE` | `/api/comments/:id` | Удалить (каскадно: tag-links к комментарию) |

### Tags

| Метод | Путь | Назначение |
|-------|------|-----------|
| `GET` | `/api/tags` | Все теги |
| `POST` | `/api/tags/for-target` | Теги для цели (body: `{ target }`) |
| `GET` | `/api/tags/for-tracked-item/:id` | Все теги трека и его фрагментов (без N+1) |
| `POST` | `/api/tags/link` | Привязать тег (body: `{ tagText, target, description? }`) |
| `POST` | `/api/tags/link/remove` | Отвязать (body: `{ tagId, target }`) |
| `GET` | `/api/tags/:id/targets` | Где используется тег |
| `PATCH` | `/api/tags/:id/description` | Обновить описание (только автор) |
| `DELETE` | `/api/tags/:id` | Удалить тег (каскадно: все tag-links) |

### Profiles

| Метод | Путь | Назначение |
|-------|------|-----------|
| `POST` | `/api/profiles/batch` | Имена пользователей по ids. Body: `{ userIds: [...] }` |

---

## Ключевые технические решения

### 1. JWT-аутентификация

**Бэк:** `jwt-sign` с секретом из `.env`, `expiresIn: 7d`. `authMiddleware` проверяет `Authorization: Bearer`, декодирует, кладёт `userId` в `req`. Контроллеры берут `authorId` оттуда — **клиент не может подделать**.

**Фронт:**
- `AuthService` (root) — хранит токен в `localStorage`, `signal` для текущего пользователя.
- `authInterceptor` — добавляет `Authorization` ко всем запросам, кроме `/api/auth/*`. На 401 — разлогинивает и редиректит на `/login`.
- `authGuard` — защищает роуты, при отсутствии токена редиректит с `returnUrl`.

### 2. Аннотации текста через CSS Custom Highlight API

**Проблема:** комментарий привязан к диапазону `start..end` в тексте фрагмента. Надо подсветить **часть текста**, не оборачивая в `<span>` (иначе сломается выделение мышью и вложенные аннотации).

**Решение:** `CSS.highlights.set('ann-' + id, new Highlight(range))` — браузер рисует фон под `Range` без DOM-манипуляций.

**Компоненты:**
- `SelectionService` — вычисляет `start`/`end`/`quote` выделения через `Range.cloneRange()` и `TreeWalker`.
- `AnnotationHighlighterService` (per-component, `providers: [AnnotationHighlighterService]`) — хранит `Map<commentId, Range>`, регистрирует `Highlight`, делает hit-test по `getClientRects()`.

**Почему per-component, а не root:** если сервис синглтон, два фрагмента перезаписывают `ranges` друг друга.

**Hover:** `::highlight` не поддерживает `:hover`. Поэтому на `mousemove` по карточке — `hitTest(x, y)` → `setHovered(commentId)` → перерисовка `Highlight` с более ярким цветом.

**Клик на аннотацию:** `getCommentIdsAt(x, y)` → popup со списком аннотаций. Клик на строку → `scrollToCommentInList` → скролл к комментарию в списке под фрагментом + flash.

**Клик на комментарий:** `scrollToAnnotation(commentId)` → `getClientRects()[0]` → `window.scrollTo` если не в viewport → flash.

### 3. Каскадное удаление

`MainOrchestrator.delete(id)`:
1. `commentsRepo.deleteByTrackedItem(id)` — все комментарии к треку и фрагментам.
2. `tagLinksRepo.deleteByTrackedItem(id)` — все связи.
3. `itemsListRepo.removeOne(id)` — сам трек.

`MainOrchestrator.removeFragment(id, fragmentId)`:
1. `commentsRepo.deleteByFragment(fragmentId)`.
2. `tagLinksRepo.deleteByFragment(fragmentId)`.
3. `item.removeFragment(fragmentId)` + `updateOne`.

`DeleteCommentUseCase` — каскадно чистит `tagLinks` к комментарию.

**Без транзакций в JSON-репозиториях** — риск рассинхрона при падении посередине. Для MVP приемлемо. В БД решается `BEGIN/COMMIT`.

### 4. Fragment ID вместо индекса

Изначально комментарии и теги ссылались на фрагмент по `fragmentIndex`. При удалении фрагмента индексы остальных съезжали — ссылки становились невалидными. Рефакторинг ввёл стабильный `id` у `TrackedItemTextFragment`. Все `target` теперь ссылаются на `fragmentId`. Это **не косметика**, а предотвращение класса багов «ссылки на несуществующий/чужой фрагмент».

### 5. Composition root

`bootstrap/container.ts` — единственное место, где создаются конкретные реализации и связываются с портами. Ни контроллеры, ни use case'ы не создают зависимости сами. Это ручной DI без фреймворка.

### 6. Seed через оркестратор

При первом запуске (`usersRepo.count() === 0`) создаётся admin из `.env`. Seed треков идёт через `orchestrator.create(...)` — чтобы `id` фрагментов генерировались корректно.

---

## Локальный запуск

### Требования

- Node.js 20+ (24 LTS рекомендуется)
- npm 10+
- Git

### Бэкенд

```powershell
cd music-business
npm install
# Создать .env в корне с содержимым:
#   ADMIN_EMAIL=admin@example.com
#   ADMIN_PASSWORD=changeme
#   ADMIN_DISPLAYNAME=Admin
#   JWT_SECRET=your-random-secret
#   JWT_EXPIRES_IN=7d
npm run dev
```

Бэк на `http://localhost:3000`. Seed создаст admin и 4 демо-трека.

### Фронтенд

```powershell
cd musician-app
npm install
npx ng serve
```

Фронт на `http://localhost:4200`. Прокси (`proxy.conf.json`) перенаправляет `/api` на `localhost:3000`.

### Вход

- Email: `admin@example.com`
- Пароль: `changeme` (или свой из `.env`)

---

## Деплой на VPS (текущее состояние)

### Что сделано

1. **VPS:** Ubuntu 24.04, 1 GB RAM, 14 GB SSD, swap 1 GB.
2. **Установлено:** Node.js 24, Nginx 1.24, PM2 7.x, git.
3. **Директории:**
   - `/opt/app/musician-app/` — статика фронта (собранный `dist/browser/`).
   - `/opt/app/musician-app-backend/` — код бэка + `node_modules` + `dist/` + `data/`.
4. **`.env` на VPS:** создан, `chmod 600`, `JWT_SECRET` сгенерирован через `openssl rand -hex 32`.
5. **PM2:** `musician-app-backend` запущен (`online`), `curl http://127.0.0.1:3000/api/health` → `{"ok":true}`.
6. **Nginx:** создан `/etc/nginx/sites-available/musician-app` на **порту 8080** (порт 80 занят другим приложением — love-letters). Конфиг: статика Angular + прокси `/api/` на `127.0.0.1:3000`.

### Что осталось проверить

- `nginx -t` — синтаксис.
- `ufw allow 8080/tcp` — открыть порт.
- Открыть `http://185.11.135.200:8080/` в браузере.
- Залогиниться с admin/пароль.

### Известные проблемы

**1. `.env` содержит `ADMIN_PASSWORD=changeme`.** Admin создан в `data/users.json` с этим паролем. **Сменить после деплоя:** удалить `data/users.json`, `data/credentials.json`, `data/profiles.json` → перезапустить PM2 → seed создаст admin с новым паролем.

**2. Порт 8080, не 80.** Порт 80 занят. Когда появится домен — перенести на 80/443 через Nginx server block с `server_name`. Тогда:
```nginx
server {
    listen 80;
    server_name music.example.com;
    # ... тот же конфиг
}
```

**3. Нет HTTPS.** Для MVP по IP — приемлемо. С доменом — Let's Encrypt (`certbot`) за 5 минут.

**4. Обновление кода — через `scp`.** Git remote на сервере не настроен. Стратегия:
- Локально: `npm run build` (бэк) + `ng build -c production` (фронт).
- `scp` архивы на VPS.
- Распаковать, `pm2 restart`.

**5. N+1 при загрузке тегов в карточке.** Эндпоинт `GET /api/tags/for-tracked-item/:id` существует, но фронт пока зовёт `getForTarget` для каждого фрагмента отдельно. Нужно починить в `TrackedItemDetailComponent.load()` — заменить N вызовов на один batch.

---

## Известные проблемы и техдолг

### Критично для продакшена

- **Регистрация на фронте отсутствует.** Только `admin` через seed. Для добавления пользователей — вручную через API (`POST /api/auth/register`) или будущий admin-панель.
- **Смена пароля admin** после деплоя (см. выше).
- **`.env` с `changeme`** — сменить.

### Не критично (для после-деплоя)

- **N+1 тегов в карточке** — batch-запрос вместо N.
- **Автодополнение тегов** — сейчас пользователь должен помнить, что тег уже есть.
- **Клик на тег → фильтр** — тег пока не навигация.
- **Описание тега** — сделано, но legacy-теги с пустым `createdBy` не редактируются.
- **Редактирование комментария** — только создать/удалить.
- **Подсветка в Safari < 17.2 / Firefox < 140** — `CSS.highlights` не поддерживается, fallback: нет подсветки, но комментарии в списке видны.
- **Пересекающиеся аннотации** — визуально один цвет. Различить можно только через popup.
- **Split/merge фрагментов** — в домене `FragmentList.splitFragmentBySeparator` / `merge` есть, UI нет.

### Известные баги

- **При добавлении тега с пробелом** иногда не все теги из строки создаются. Причина не локализована. Воспроизводится редко. Приоритет — низкий.

---

## Что дальше

### Ближайшие шаги (после деплоя)

1. Сменить пароль admin.
2. Открыть порт 8080, проверить доступ снаружи.
3. Если есть домен — прикрутить, перенести на 80/443, HTTPS через Let's Encrypt.
4. Починить N+1 тегов в карточке.

### Следующая итерация

1. **Регистрация на фронте** (страница `/register` + опция «только по инвайту»).
2. **Фильтр по тегам** — страница `/tags/:tagId` или фильтр на списке.
3. **Поиск** по artist/title/тексту фрагментов.
4. **Аспекты изучения** — `textDone`, `musicDone`, `performanceDone` как отдельные оси прогресса.
5. **Spaced repetition** — `nextReviewAt`, `interval`, `repetitions`. По SM-2 или упрощённой формуле.
6. **Экран «Сегодня»** — очередь на повторение + треки в работе.

---

## Соглашения по коду

### Коммиты

Формат: `<тип>: <короткое описание в императиве>`.

Типы:
- `feat:` — новая функциональность.
- `fix:` — исправление бага.
- `refactor:` — рефакторинг без изменения поведения.
- `chore:` — рутина (зависимости, конфиги, gitignore).
- `docs:` — документация.

Примеры:
- `feat: add Comment entity with polymorphic target`
- `fix: cascade delete on fragment removal`
- `refactor: use fragment id instead of index`

### Git-flow

- `master` — стабильная ветка.
- `feature/<name>` — фичи. Мержатся в `master` после готовности.
- Один коммит — одна логическая единица.
- Перед `git push` — `git pull --rebase`, если в `master` были изменения.

### Архитектурные правила

- **Домен не зависит от инфраструктуры.** Никаких импортов из `infrastructure` в `domain`.
- **Порты — в domain.** Интерфейсы репозиториев и сервисов.
- **Реализации — в infrastructure.** JSON, HTTP, JWT, bcrypt.
- **Use cases — тонкие.** Вся валидация и инварианты — в домене или на бэке.
- **Композиция — в `bootstrap/container.ts`.** Единственное место создания конкретных реализаций.
- **Никаких `new` в use case'ах.** Зависимости через конструктор.
- **`fragmentId` вместо индекса** во всех ссылках на фрагменты.

---

## Лицензия

Приватный проект. Не для распространения.
