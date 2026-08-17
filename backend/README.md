# AbetBay Backend

FastAPI + PostgreSQL + SQLAlchemy + Alembic + JWT + Pydantic.

## Structure

```text
backend/
├── app/
│   ├── core/           # config, database, security
│   ├── api/v1/         # HTTP routes
│   ├── models.py       # SQLAlchemy models
│   ├── schemas.py      # Pydantic request/response
│   ├── services.py     # Business logic
│   └── main.py         # App entrypoint
├── alembic/            # Migrations
└── scripts/seed.py     # Admin + demo data
```

## Setup

```bash
py -3.12 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs
- Admin: `admin@example.com` / `Password123!`
