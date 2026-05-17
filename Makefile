.PHONY: dev

dev:
	@echo "🚀 Starting Horizon AI Dev Servers..."
	@trap 'kill 0' INT; \
	cd backend && .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload & \
	cd horizon-ai && bun run dev
