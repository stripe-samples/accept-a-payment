# Custom Checkout Quickstart - Manual Test Infrastructure

Launches all 14 server+client combinations from the Custom Checkout quickstart
docs page for manual end-to-end testing.

| Dimension | Values |
|-----------|--------|
| Servers   | node, python, ruby, php, java, go, dotnet (7 total) |
| Clients   | HTML (vanilla JS), React (2 total) |
| **Total** | **14 combinations** |

## How it works

**Step 1 - extract.py** reads the live Markdoc source files from the pay-server
docs tree and generates clean, runnable code into `generated/`. This is the
same code users get from the docs "Download example" button (without the
browser-side JSZip step). You can re-run it any time to pick up doc changes.

**Step 2 - run-all.sh** installs dependencies, starts all servers, and opens
all 14 URLs in the browser.

---

## Prerequisites

| Tool | Install |
|------|---------|
| Python 3.8+ | Built-in on devbox |
| `mise` | https://mise.jdx.dev/ |
| node, python, ruby, php, java, go, dotnet | `mise install` |
| `nc` (netcat) | `apt install netcat-openbsd` |

Install language runtimes with mise:
```bash
mise install node python ruby php java go dotnet
```

---

## Quick start

```bash
# 1. Generate code from docs source
python3 extract.py

# 2. Set up credentials
cp .env.example .env
# Edit .env with your Stripe test keys and a Price ID

# 3. Launch all 14 servers
./run-all.sh
```

All 14 URLs open in your browser automatically. Press Ctrl+C to stop all
servers.

---

## Port allocation

| Language | HTML server | React backend | React dev server |
|----------|-------------|---------------|-----------------|
| node     | 4242        | 4249          | 3000            |
| python   | 4243        | 4250          | 3001            |
| ruby     | 4244        | 4251          | 3002            |
| php      | 4245        | 4252          | 3003            |
| java     | 4246        | 4253          | 3004            |
| go       | 4247        | 4254          | 3005            |
| dotnet   | 4248        | 4255          | 3006            |

**HTML URLs** (7): `http://localhost:424{2-8}/checkout.html`
**React URLs** (7): `http://localhost:300{0-6}/`

---

## Flags

```
./run-all.sh [options]

--skip-install   Skip npm/pip/bundle/etc. (use when deps already installed)
--html-only      Start only the 7 HTML-client servers
--react-only     Start only the 7 React-client server+dev combos
--no-open        Don't auto-open URLs in browser
```

---

## Directory structure after extraction

```
generated/
  node-html/          # Node server + HTML client (port 4242)
    server.js
    package.json
    .env.example
    public/
      checkout.html, checkout.js, checkout.css
      complete.html, complete.js, complete.css

  node-react/         # Node server + React client (server: 4249, React: 3000)
    server.js
    package.json
    .env.example
    client/
      package.json    # proxy -> localhost:4249
      src/            App.jsx, CheckoutForm.jsx, Complete.jsx, App.css, index.js
      public/         index.html

  python-html/        # (same pattern for python, ruby, php, java, go, dotnet)
  python-react/
  ruby-html/
  ruby-react/
  php-html/
  php-react/
  java-html/
  java-react/
  go-html/
  go-react/
  dotnet-html/
  dotnet-react/

logs/               # Server stdout/stderr (created at runtime)
```

---

## Regenerating after doc changes

```bash
python3 extract.py  # overwrites generated/ completely
```

The extraction script reads from the live pay-server checkout at
`/pay/src/pay-server/docs/content/integration-builder/custom-checkout/files/`.

---

## What extract.py does

1. Reads each Markdoc server/client file (`.md`)
2. Applies step conditionals:
   - `client = html` or `react` (generates both variants)
   - `checkoutSessionPriceData = disabled` (uses `STRIPE_PRICE_ID` env var)
   - `mode = payment`
   - No toggles (no customize/address/automatic-tax)
3. Expands template variables: `{{PRICE_ID}}`, `{{CHECKOUT_MODE}}`, SDK versions, etc.
4. Adds dotenv loading to each server so `.env` is read automatically
5. Writes per-combination dependency files (package.json, requirements.txt, etc.)

The generated code is intentionally close to what the docs "Download example"
button produces, with these additions:
- `dotenv` loading (Node/Python/Ruby) so keys come from `.env`
- `STRIPE_PRICE_ID` read from env instead of hardcoded placeholder

---

## Download button vs markdown parsing

The docs "Download example" button (DownloadButton.tsx) uses JSZip entirely
in the browser - there is no server-side API or build step that generates the
zip. Reusing it would require running the full docs React app and scripting a
browser. The markdown parsing approach used here produces equivalent output
with a simple Python script.

---

## Logs

Server logs are written to `logs/` at runtime:
```
logs/node-html.log
logs/node-react-server.log
logs/node-react-client.log
... (one file per process)
```

---

## Troubleshooting

**Server won't start**: Check `logs/{lang}-{client}.log` for the error.

**Port already in use**: Something is already on port 4242-4255 or 3000-3006.
Stop other servers or kill with `lsof -ti:4242 | xargs kill`.

**"generated/ not found"**: Run `python3 extract.py` first.

**"STRIPE_SECRET_KEY not set"**: Copy `.env.example` to `.env` and fill it in.

**React dev server slow to start**: The health check waits up to 30s per port.
React's first compilation can take longer - check `logs/{lang}-react-client.log`.

**mise runtime missing**: Run `mise install` and ensure your `.mise.toml` or
`~/.config/mise/config.toml` includes the needed language versions.
