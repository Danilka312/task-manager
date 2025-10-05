# Task Manager — FastAPI + React (Vite + Tailwind)

Лёгкий, но эффектный менеджер задач с авторизацией, канбан-доской, фильтрами/поиском, аналитикой и календарём сроков. Проект задуман как демонстрация креативного UI и аккуратной архитектуры без сложной инфраструктуры.

## ✨ Основные фичи
- **Auth**: регистрация, логин (JWT access/refresh), `/api/auth/me`
- **Канбан**: колонки *To Do / In Progress / Done*, быстрые действия (изменить статус/удалить)
- **Создание/редактирование** задач: название, описание, срок (`due_date`), приоритет
- **Фильтры и поиск**: по статусу, приоритету, названию/описанию, диапазону дат; синхронизация в URL
- **Аналитика**: активные, завершённые, просроченные
- **Календарь** (month view): проекция задач по `due_date`, чипы по приоритетам, “Open on Board”
- **UI**: Tailwind, тёмная/светлая тема, центрированная сетка, бейджи приоритетов, подсветка today/overdue

## 🧰 Стек
- **Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic v2, Uvicorn  
- **Auth:** JWT (HS256), `python-jose`, `passlib` (`pbkdf2_sha256`)  
- **DB:** SQLite (по умолчанию)  
- **Frontend:** React + Vite + TypeScript + Tailwind CSS  
- **Tests:** Pytest + FastAPI TestClient  
- **DevX:** GitHub CLI (`gh`), Cursor/Codex

## 🏗️ Архитектура и структура

task-manager/
├─ backend/
│ ├─ app/
│ │ ├─ api/
│ │ │ ├─ auth.py # регистрация/логин/refresh/me
│ │ │ ├─ tasks.py # CRUD + фильтры/поиск
│ │ │ └─ analytics.py # summary: active/done/overdue
│ │ ├─ auth/
│ │ │ ├─ deps.py # get_current_user (JWT)
│ │ │ └─ security.py # hash/verify pwd, create tokens
│ │ ├─ infra/
│ │ │ ├─ db.py # engine, SessionLocal, Base
│ │ │ └─ models.py # UserORM, TaskORM
│ │ ├─ repo/
│ │ │ └─ tasks.py # репозиторий задач
│ │ ├─ schemas/
│ │ │ └─ tasks.py # Pydantic-модели
│ │ └─ main.py # FastAPI app + CORS + routers + /healthz
│ ├─ db/
│ │ ├─ env.py # Alembic env (target_metadata=Base.metadata)
│ │ └─ versions/ # миграции
│ ├─ requirements.txt
│ └─ requirements-dev.txt
└─ frontend/
├─ src/
│ ├─ pages/
│ │ ├─ Login.tsx
│ │ ├─ Board.tsx
│ │ ├─ Analytics.tsx
│ │ └─ Calendar.tsx
│ ├─ store/
│ │ ├─ auth.ts # хранение токенов
│ │ └─ theme.ts # dark/light
│ ├─ lib/api.ts # axios + auth header
│ ├─ App.tsx
│ ├─ main.tsx
│ └─ index.css
├─ tailwind.config.js
├─ postcss.config.cjs
├─ vite.config.ts
└─ package.json
## 🚀 Быстрый старт

### Предустановки
- Python **3.10/3.11**, Node.js **18+**, Git

### 1) Backend
```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# миграции/переменные окружения (dev)
$env:DATABASE_URL = "sqlite:///./tm.sqlite3"
alembic upgrade head
$env:JWT_SECRET = "dev_secret_change_me"

# запуск API
uvicorn app.main:app --reload --port 8000
# проверка
Invoke-RestMethod -Uri http://127.0.0.1:8000/healthz
cd ../frontend
npm i
# (опц.) .env: VITE_API_URL=http://127.0.0.1:8000
npm run dev
# http://localhost:5173

Аутентификация

POST /api/auth/register (email, password>=6, full_name?)

POST /api/auth/login (username=email&password=... form-data)

GET /api/auth/me (Bearer access)

POST /api/auth/refresh (refresh → access)

📦 API кратко

Health

GET /healthz

Tasks

GET /api/tasks/?page=1&page_size=50&status=todo|in_progress|done&priority=low|medium|high|urgent&q=...&from=YYYY-MM-DD&to=YYYY-MM-DD

POST /api/tasks/

PATCH /api/tasks/{id}

DELETE /api/tasks/{id}

Analytics

GET /api/analytics/summary → { active, done, overdue }

🧪 Тесты

cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
pytest -q
🖼️ UI заметки

Три колонки канбана, центрированная раскладка

Бейджи приоритетов и подсветка overdue/today

Фильтры/поиск с синхронизацией в URL

Календарь (month view) с чипами задач и боковой панелью дня

Светлая/тёмная тема, переключатель в топбаре

🛠️ Частые проблемы

python-multipart: pip install python-multipart

Email validation: pip install "pydantic[email]"

bcrypt (Windows): используется pbkdf2_sha256

CORS: при другом origin добавьте его в app/main.py

🗺️ Roadmap

Drag & drop карточек между колонками

Напоминания по срокам (клиент)

Экспорт/импорт задач (JSON)

Доп. аналитика (тенденции)

Теги/проекты



Быстрые примеры (PowerShell)
# регистрация
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/auth/register `
  -ContentType "application/json" -Body '{"email":"demo@example.com","password":"demopass","full_name":"Demo"}'

# логин
$token = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/auth/login `
  -ContentType "application/x-www-form-urlencoded" -Body "username=demo@example.com&password=demopass"
$Headers = @{ Authorization = "Bearer " + $token.access }

# создать задачу
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/tasks/ -Headers $Headers `
  -ContentType "application/json" -Body '{"title":"My task","priority":"high","due_date":"2025-10-06"}'

