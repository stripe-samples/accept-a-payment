#!/usr/bin/env bash
# Start all 7 servers and 7 React dev servers for manual testing.
# Each server gets a unique port so all 14 combinations run simultaneously.
#
# Usage: ./test-all.sh
# Prerequisites: npm, ruby, python3, go, mvn, dotnet, php installed (use mise)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v mise &>/dev/null; then
  echo "mise is required but not installed. Install it with:"
  echo "  curl https://mise.run | sh"
  echo "Then restart your shell and re-run this script."
  exit 1
fi

# Install all required language runtimes via mise
echo "Installing runtimes via mise..."
mise install node python ruby go java dotnet "ubi:adwinying/php"
PIDS=()

cleanup() {
  echo ""
  echo "Shutting down all servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

wait_for_server() {
  local url="$1" name="$2" timeout=30
  printf "  %-8s waiting..." "$name"
  for i in $(seq 1 $timeout); do
    if curl -sf "$url/config" >/dev/null 2>&1; then
      printf "\r  %-8s ready at %s\n" "$name" "$url"
      return 0
    fi
    sleep 1
  done
  printf "\r  %-8s FAILED to start at %s\n" "$name" "$url"
  return 1
}

# --- Check for .env ---
if [ ! -f "$SCRIPT_DIR/server/node/.env" ]; then
  echo "Error: server/node/.env not found. Copy .env.example and add your Stripe keys:"
  echo "  cp .env.example server/node/.env"
  exit 1
fi

# Share the same .env across all servers
ENV_FILE="$SCRIPT_DIR/server/node/.env"
copy_env() {
  local dir="$1"
  [ -f "$dir/.env" ] || cp "$ENV_FILE" "$dir/.env"
}

# --- Install dependencies ---
echo "Installing dependencies..."
(cd "$SCRIPT_DIR/server/node" && npm install --silent) &
(cd "$SCRIPT_DIR/server/ruby" && copy_env . && bundle install --quiet) &
(cd "$SCRIPT_DIR/server/python" && copy_env . && pip install -q -r requirements.txt) &
(cd "$SCRIPT_DIR/server/go" && copy_env . && go build -o /dev/null server.go) &
(cd "$SCRIPT_DIR/server/java" && copy_env . && mvn -q compile) &
(cd "$SCRIPT_DIR/server/dotnet" && copy_env .) &
(cd "$SCRIPT_DIR/server/php" && copy_env . && composer install --quiet) &
(cd "$SCRIPT_DIR/client/react-cra" && npm install --silent) &
wait
echo "Dependencies installed."
echo ""

# --- Start servers ---
echo "Starting servers..."

PORT=4242 \
  node "$SCRIPT_DIR/server/node/server.js" >/dev/null 2>&1 &
PIDS+=($!)

cd "$SCRIPT_DIR/server/ruby" && PORT=4243 \
  ruby server.rb >/dev/null 2>&1 &
PIDS+=($!)
cd "$SCRIPT_DIR"

cd "$SCRIPT_DIR/server/python" && PORT=4244 \
  python3 server.py >/dev/null 2>&1 &
PIDS+=($!)
cd "$SCRIPT_DIR"

cd "$SCRIPT_DIR/server/go" && PORT=4245 \
  go run server.go >/dev/null 2>&1 &
PIDS+=($!)
cd "$SCRIPT_DIR"

cd "$SCRIPT_DIR/server/java" && PORT=4246 \
  mvn -q exec:java >/dev/null 2>&1 &
PIDS+=($!)
cd "$SCRIPT_DIR"

cd "$SCRIPT_DIR/server/dotnet" && PORT=4247 \
  dotnet run >/dev/null 2>&1 &
PIDS+=($!)
cd "$SCRIPT_DIR"

PORT=4248 \
  php -S localhost:4248 -t "$SCRIPT_DIR/server/php" "$SCRIPT_DIR/server/php/router.php" >/dev/null 2>&1 &
PIDS+=($!)

# Wait for all servers
wait_for_server http://localhost:4242 Node
wait_for_server http://localhost:4243 Ruby
wait_for_server http://localhost:4244 Python
wait_for_server http://localhost:4245 Go
wait_for_server http://localhost:4246 Java
wait_for_server http://localhost:4247 .NET
wait_for_server http://localhost:4248 PHP
echo ""

# --- Start React dev servers ---
echo "Starting React dev servers..."

REACT_DIR="$SCRIPT_DIR/client/react-cra"

VITE_SERVER_URL=http://localhost:4242 PORT=3000 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

VITE_SERVER_URL=http://localhost:4243 PORT=3001 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

VITE_SERVER_URL=http://localhost:4244 PORT=3002 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

VITE_SERVER_URL=http://localhost:4245 PORT=3003 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

VITE_SERVER_URL=http://localhost:4246 PORT=3004 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

VITE_SERVER_URL=http://localhost:4247 PORT=3005 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

VITE_SERVER_URL=http://localhost:4248 PORT=3006 \
  npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
PIDS+=($!)

sleep 3

echo ""
echo "Server      HTML Client                    React Client"
echo "------      -----------                    ------------"
echo "Node        http://localhost:4242          http://localhost:3000"
echo "Ruby        http://localhost:4243          http://localhost:3001"
echo "Python      http://localhost:4244          http://localhost:3002"
echo "Go          http://localhost:4245          http://localhost:3003"
echo "Java        http://localhost:4246          http://localhost:3004"
echo ".NET        http://localhost:4247          http://localhost:3005"
echo "PHP         http://localhost:4248          http://localhost:3006"
echo ""

# Open all 14 URLs
for i in $(seq 0 6); do
  open "http://localhost:$((4242 + i))"
  open "http://localhost:$((3000 + i))"
done

echo "All 14 tabs opened. Press Enter to shut down all servers."
read -r
