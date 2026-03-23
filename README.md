# Электронный дневник ИМСИТ

Веб-система электронного дневника для Академии маркетинга и социально-информационных технологий (Краснодар).

## Технический стек

- **Backend:** Python 3.12 + FastAPI + SQLAlchemy + Alembic
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Frontend:** React 18 + Vite + TailwindCSS + Recharts
- **Auth:** JWT (access + refresh tokens), RBAC

## Запуск

```bash
git clone <repo-url>
cd imsit-diary
cp .env.example .env
make up && make migrate && make seed
```

## Доступ после запуска

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **Swagger:** http://localhost:8000/docs

## Тестовые аккаунты

| Роль          | Email              | Пароль      |
|---------------|--------------------|-------------|
| Администратор | admin@imsit.ru     | admin123    |
| Студент       | student@imsit.ru   | student123  |
| Родитель      | parent@imsit.ru    | parent123   |
| Преподаватель | teacher@imsit.ru   | teacher123  |

## Команды

| Команда        | Описание                          |
|----------------|-----------------------------------|
| `make up`      | Запуск всех контейнеров           |
| `make seed`    | Генерация тестовых данных         |
| `make down`    | Остановка и удаление контейнеров  |
| `make logs`    | Просмотр логов                    |
| `make migrate` | Применение миграций БД            |
| `make shell`   | Bash-консоль backend контейнера   |
