#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🛡️  Starting AEGIS — Digital Risk Protection Platform"
echo "=========================================================="

# Ensure NVM / Node path is available
if [ -d "$HOME/.nvm/versions/node/v22.19.0/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
fi

# 1. Initialize Backend
echo "[1/3] Initializing Backend Database..."
cd "$DIR/backend"
PYTHONPATH="$DIR/backend" "$DIR/backend/venv/bin/python" -m app.db.init_db

# 2. Start Backend ASGI Server
echo "[2/3] Starting FastAPI Backend on http://127.0.0.1:8000..."
PYTHONPATH="$DIR/backend" "$DIR/backend/venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Trap Ctrl+C to cleanly kill both servers
cleanup() {
  echo ""
  echo "Shutting down AEGIS servers..."
  kill $BACKEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start Frontend Dev Server
echo "[3/3] Starting Vite Frontend on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173
