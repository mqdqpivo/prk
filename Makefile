.PHONY: up down seed logs migrate shell

up:
	docker-compose up --build -d

seed:
	docker-compose exec backend python -m app.seed.generate

down:
	docker-compose down -v

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend python -c "from app.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine); print('Tables created')"

shell:
	docker-compose exec backend bash
