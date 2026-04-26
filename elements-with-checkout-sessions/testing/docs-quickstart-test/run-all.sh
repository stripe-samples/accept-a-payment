#!/usr/bin/env bash
# run-all.sh - Launch all 14 Custom Checkout quickstart server combinations.
#
# Starts 7 HTML-client servers (ports 4242-4248) and 7 React-client servers
# (backend ports 4249-4255, React dev servers ports 3000-3006), then opens
# all 14 URLs in the browser for manual testing.
#
# Prerequisites:
#   1. Run extract.py first to generate server code from docs markdown.
#   2. Copy .env.example -> .env and fill in your Stripe test keys.
#   3. mise installed (https://mise.jdx.dev/) with node, python, ruby, php,
#      java, go, dotnet runtimes available.
#
# Usage:
#   ./run-all.sh [--skip-install] [--html-only] [--react-only] [--no-open]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATED="$SCRIPT_DIR/generated"
ENV_FILE="$SCRIPT_DIR/.env"

# --------------------------------------------------------------------------
# Argument parsing
# --------------------------------------------------------------------------
SKIP_INSTALL=false
HTML_ONLY=false
REACT_ONLY=false
NO_OPEN=false

for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=true ;;
    --html-only)    HTML_ONLY=true ;;
    --react-only)   REACT_ONLY=true ;;
    --no-open)      NO_OPEN=true ;;
    --help|-h)
      grep "^#" "$0" | head -20 | sed 's/^# \?//'
      exit 0
      ;;
  esac
done

# --------------------------------------------------------------------------
# Colours / formatting
# --------------------------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}${BLUE}=== $* ===${RESET}\n"; }

# --------------------------------------------------------------------------
# Preflight checks
# --------------------------------------------------------------------------
header "Preflight checks"

# Check generated directory exists
if [[ ! -d "$GENERATED" ]]; then
  error "generated/ not found. Run first: python3 extract.py"
  exit 1
fi

# Load .env
if [[ ! -f "$ENV_FILE" ]]; then
  error ".env not found. Copy .env.example -> .env and fill in your Stripe keys."
  exit 1
fi

set -a; source "$ENV_FILE"; set +a
: "${STRIPE_SECRET_KEY:?STRIPE_SECRET_KEY not set in .env}"
: "${STRIPE_PUBLISHABLE_KEY:?STRIPE_PUBLISHABLE_KEY not set in .env}"
: "${STRIPE_PRICE_ID:?STRIPE_PRICE_ID not set in .env}"
success "Loaded .env"

# Check mise
if ! command -v mise &>/dev/null; then
  error "mise not found. Install from https://mise.jdx.dev/"
  exit 1
fi
success "mise found: $(mise --version)"

# --------------------------------------------------------------------------
# Port / language table
# --------------------------------------------------------------------------
# Languages in order (index 0-6)
LANGUAGES=(node python ruby php java go dotnet)

# HTML server ports: 4242-4248
HTML_BASE_PORT=4242
# React backend server ports: 4249-4255
REACT_BACKEND_BASE=4249
# React dev server ports: 3000-3006
REACT_DEV_BASE=3000

# --------------------------------------------------------------------------
# Process tracking
# --------------------------------------------------------------------------
declare -a PIDS=()

cleanup() {
  echo ""
  header "Shutting down all servers"
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  # Kill any stray react-scripts processes we started
  pkill -f "react-scripts start" 2>/dev/null || true
  success "All servers stopped."
}
trap cleanup EXIT INT TERM

# --------------------------------------------------------------------------
# Helper: wait for a port to be open
# --------------------------------------------------------------------------
wait_for_port() {
  local port="$1"
  local label="$2"
  local max=30
  local n=0
  while ! nc -z localhost "$port" 2>/dev/null; do
    sleep 1
    n=$((n+1))
    if [[ $n -ge $max ]]; then
      warn "  Timeout waiting for $label on :$port"
      return 1
    fi
  done
  success "  $label ready on :$port"
}

# --------------------------------------------------------------------------
# Helper: create .env for a server directory
# --------------------------------------------------------------------------
write_server_env() {
  local dir="$1"
  cat > "$dir/.env" <<EOF
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ID=$STRIPE_PRICE_ID
EOF
}

# --------------------------------------------------------------------------
# Dependency installation
# --------------------------------------------------------------------------
install_deps() {
  local lang="$1"
  local dir="$2"
  local label="$3"

  info "Installing $label deps in $dir..."

  case "$lang" in
    node)
      (cd "$dir" && mise exec node -- npm install --silent) 2>&1 | tail -3
      ;;
    python)
      local venv="$dir/.venv"
      [[ -d "$venv" ]] || mise exec python -- python3 -m venv "$venv"
      (cd "$dir" && "$venv/bin/pip" install -q -r requirements.txt)
      ;;
    ruby)
      (cd "$dir" && mise exec ruby -- bundle install --quiet)
      ;;
    php)
      (cd "$dir" && mise exec php -- composer install -q --no-interaction)
      ;;
    java)
      (cd "$dir" && mise exec java -- mvn -q package -DskipTests)
      ;;
    go)
      (cd "$dir" && mise exec go -- go mod download -x 2>/dev/null | tail -3 || true)
      ;;
    dotnet)
      (cd "$dir" && mise exec dotnet -- dotnet restore -v q)
      ;;
  esac
  success "  $label deps installed"
}

# --------------------------------------------------------------------------
# Server launchers
# --------------------------------------------------------------------------
start_html_server() {
  local lang="$1"
  local idx="$2"
  local port=$((HTML_BASE_PORT + idx))
  local dir="$GENERATED/${lang}-html"

  if [[ ! -d "$dir" ]]; then
    warn "Skip $lang-html: $dir not found"
    return
  fi

  write_server_env "$dir"

  local log="$SCRIPT_DIR/logs/${lang}-html.log"
  mkdir -p "$SCRIPT_DIR/logs"

  case "$lang" in
    node)
      $SKIP_INSTALL || install_deps node "$dir" "node-html"
      PORT=$port mise exec node -- node "$dir/server.js" >"$log" 2>&1 &
      ;;
    python)
      $SKIP_INSTALL || install_deps python "$dir" "python-html"
      (cd "$dir" && PORT=$port ./.venv/bin/python server.py) >"$log" 2>&1 &
      ;;
    ruby)
      $SKIP_INSTALL || install_deps ruby "$dir" "ruby-html"
      (cd "$dir" && PORT=$port mise exec ruby -- bundle exec ruby server.rb) >"$log" 2>&1 &
      ;;
    php)
      $SKIP_INSTALL || install_deps php "$dir" "php-html"
      (cd "$dir" && mise exec php -- php -S localhost:$port -t public) >"$log" 2>&1 &
      ;;
    java)
      $SKIP_INSTALL || install_deps java "$dir" "java-html"
      (cd "$dir" && PORT=$port mise exec java -- java \
        -cp "target/sample-jar-with-dependencies.jar" \
        com.stripe.sample.Server) >"$log" 2>&1 &
      ;;
    go)
      $SKIP_INSTALL || install_deps go "$dir" "go-html"
      (cd "$dir" && PORT=$port mise exec go -- go run server.go) >"$log" 2>&1 &
      ;;
    dotnet)
      $SKIP_INSTALL || install_deps dotnet "$dir" "dotnet-html"
      (cd "$dir" && ASPNETCORE_URLS="http://localhost:$port" \
        mise exec dotnet -- dotnet run) >"$log" 2>&1 &
      ;;
  esac

  PIDS+=("$!")
  info "  Started $lang-html on :$port (PID $!)"
}

start_react_server() {
  local lang="$1"
  local idx="$2"
  local backend_port=$((REACT_BACKEND_BASE + idx))
  local react_port=$((REACT_DEV_BASE + idx))
  local dir="$GENERATED/${lang}-react"

  if [[ ! -d "$dir" ]]; then
    warn "Skip $lang-react: $dir not found"
    return
  fi

  write_server_env "$dir"

  local log_be="$SCRIPT_DIR/logs/${lang}-react-server.log"
  local log_fe="$SCRIPT_DIR/logs/${lang}-react-client.log"
  mkdir -p "$SCRIPT_DIR/logs"

  # Start backend
  case "$lang" in
    node)
      $SKIP_INSTALL || install_deps node "$dir" "node-react-server"
      PORT=$backend_port mise exec node -- node "$dir/server.js" >"$log_be" 2>&1 &
      ;;
    python)
      $SKIP_INSTALL || install_deps python "$dir" "python-react-server"
      (cd "$dir" && PORT=$backend_port ./.venv/bin/python server.py) >"$log_be" 2>&1 &
      ;;
    ruby)
      $SKIP_INSTALL || install_deps ruby "$dir" "ruby-react-server"
      (cd "$dir" && PORT=$backend_port mise exec ruby -- bundle exec ruby server.rb) >"$log_be" 2>&1 &
      ;;
    php)
      $SKIP_INSTALL || install_deps php "$dir" "php-react-server"
      (cd "$dir" && mise exec php -- php -S localhost:$backend_port -t public) >"$log_be" 2>&1 &
      ;;
    java)
      $SKIP_INSTALL || install_deps java "$dir" "java-react-server"
      (cd "$dir" && PORT=$backend_port mise exec java -- java \
        -cp "target/sample-jar-with-dependencies.jar" \
        com.stripe.sample.Server) >"$log_be" 2>&1 &
      ;;
    go)
      $SKIP_INSTALL || install_deps go "$dir" "go-react-server"
      (cd "$dir" && PORT=$backend_port mise exec go -- go run server.go) >"$log_be" 2>&1 &
      ;;
    dotnet)
      $SKIP_INSTALL || install_deps dotnet "$dir" "dotnet-react-server"
      (cd "$dir" && ASPNETCORE_URLS="http://localhost:$backend_port" \
        mise exec dotnet -- dotnet run) >"$log_be" 2>&1 &
      ;;
  esac

  PIDS+=("$!")
  info "  Started $lang-react backend on :$backend_port (PID $!)"

  # Install and start React dev server
  local client_dir="$dir/client"
  if [[ -d "$client_dir" ]]; then
    # Write React .env
    echo "REACT_APP_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" > "$client_dir/.env"

    if ! $SKIP_INSTALL; then
      info "  Installing React deps for $lang..."
      (cd "$client_dir" && mise exec node -- npm install --silent) 2>&1 | tail -3
    fi

    PORT=$react_port BROWSER=none \
      mise exec node -- npx --prefix "$client_dir" react-scripts start \
      >"$log_fe" 2>&1 &
    PIDS+=("$!")
    info "  Started $lang React dev server on :$react_port (PID $!)"
  fi
}

# --------------------------------------------------------------------------
# Main: install + start
# --------------------------------------------------------------------------
header "Starting servers"

for idx in "${!LANGUAGES[@]}"; do
  lang="${LANGUAGES[$idx]}"
  if ! $REACT_ONLY; then
    start_html_server "$lang" "$idx"
  fi
  if ! $HTML_ONLY; then
    start_react_server "$lang" "$idx"
  fi
done

# --------------------------------------------------------------------------
# Health checks
# --------------------------------------------------------------------------
header "Health checks"

for idx in "${!LANGUAGES[@]}"; do
  lang="${LANGUAGES[$idx]}"
  html_port=$((HTML_BASE_PORT + idx))
  react_port=$((REACT_DEV_BASE + idx))

  if ! $REACT_ONLY; then
    wait_for_port "$html_port" "$lang-html" || true
  fi
  if ! $HTML_ONLY; then
    wait_for_port "$react_port" "$lang-react" || true
  fi
done

# --------------------------------------------------------------------------
# URL table
# --------------------------------------------------------------------------
header "Test URLs"

printf "${BOLD}%-12s  %-45s  %-45s${RESET}\n" "Language" "HTML client" "React client"
printf "%-12s  %-45s  %-45s\n" "--------" "-----------" "------------"

for idx in "${!LANGUAGES[@]}"; do
  lang="${LANGUAGES[$idx]}"
  html_port=$((HTML_BASE_PORT + idx))
  react_port=$((REACT_DEV_BASE + idx))
  printf "${GREEN}%-12s${RESET}  ${CYAN}http://localhost:%d/checkout.html${RESET}  ${CYAN}http://localhost:%d/${RESET}\n" \
    "$lang" "$html_port" "$react_port"
done

echo ""

# --------------------------------------------------------------------------
# Open in browser (optional)
# --------------------------------------------------------------------------
if ! $NO_OPEN; then
  info "Opening all 14 URLs in browser..."
  sleep 2  # give dev servers a moment

  open_url() {
    local url="$1"
    if command -v open &>/dev/null; then
      open "$url"
    elif command -v xdg-open &>/dev/null; then
      xdg-open "$url" 2>/dev/null
    fi
  }

  for idx in "${!LANGUAGES[@]}"; do
    lang="${LANGUAGES[$idx]}"
    if ! $REACT_ONLY; then
      open_url "http://localhost:$((HTML_BASE_PORT + idx))/checkout.html"
    fi
    if ! $HTML_ONLY; then
      open_url "http://localhost:$((REACT_DEV_BASE + idx))/"
    fi
    sleep 0.3
  done
fi

# --------------------------------------------------------------------------
# Wait
# --------------------------------------------------------------------------
echo ""
info "All servers running. Press Ctrl+C to stop."
wait
