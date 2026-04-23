#!/usr/bin/env bash
# Start all 7 servers and 7 React dev servers for manual testing.
# Each server gets a unique port so all 14 combinations run simultaneously.
#
# Usage: ./testing/manual-test.sh
# Prerequisites: mise (https://mise.jdx.dev)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SAMPLE_DIR="$SCRIPT_DIR/.."

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

# Kill any leftover processes from a previous run
for port in $(seq 4242 4248) $(seq 3000 3006); do
  kill $(lsof -ti :$port) 2>/dev/null || true
done

cleanup() {
  echo ""
  echo "Shutting down all servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  for port in $(seq 4242 4248) $(seq 3000 3006); do
    kill $(lsof -ti :$port) 2>/dev/null || true
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

# --- Load .env ---
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "Error: testing/.env not found. Copy .env.example and add your Stripe keys:"
  echo "  cp .env.example testing/.env"
  exit 1
fi

set -a
source "$SCRIPT_DIR/.env"
set +a

# --- Install dependencies ---
echo "Installing dependencies..."
(cd "$SAMPLE_DIR/server/node" && npm install --silent) &
(cd "$SAMPLE_DIR/server/ruby" && bundle install --quiet) &
(cd "$SAMPLE_DIR/server/python" && pip install -q -r requirements.txt) &
(cd "$SAMPLE_DIR/server/go" && go build -o /dev/null server.go) &
(cd "$SAMPLE_DIR/server/java" && mvn -q compile) &
(cd "$SAMPLE_DIR/server/php" && composer install --quiet) &
(cd "$SAMPLE_DIR/client/react-cra" && npm install --silent) &
wait
echo "Dependencies installed."
echo ""

# --- Start servers ---
echo "Starting servers..."

cd "$SAMPLE_DIR/server/node" && PORT=4242 \
  node server.js >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

cd "$SAMPLE_DIR/server/ruby" && PORT=4243 \
  ruby server.rb >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

cd "$SAMPLE_DIR/server/python" && PORT=4244 \
  python3 server.py >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

cd "$SAMPLE_DIR/server/go" && PORT=4245 \
  go run server.go >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

cd "$SAMPLE_DIR/server/java" && PORT=4246 \
  mvn -q exec:java >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

cd "$SAMPLE_DIR/server/dotnet" && PORT=4247 \
  dotnet run >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

cd "$SAMPLE_DIR/server/php" && PORT=4248 \
  php -S localhost:4248 router.php >/dev/null 2>&1 &
PIDS+=($!)
cd "$SAMPLE_DIR"

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

REACT_DIR="$SAMPLE_DIR/client/react-cra"

for i in $(seq 0 6); do
  VITE_SERVER_URL="http://localhost:$((4242 + i))" \
  PORT=$((3000 + i)) \
    npx --prefix "$REACT_DIR" vite --config "$REACT_DIR/vite.config.mjs" "$REACT_DIR" >/dev/null 2>&1 &
  PIDS+=($!)
done

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
