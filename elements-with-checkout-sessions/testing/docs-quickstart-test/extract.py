#!/usr/bin/env python3
"""
extract.py - Extract runnable code from the Custom Checkout quickstart docs markdown files.

Reads Markdoc source files from the pay-server docs tree and generates a clean
directory tree per server+client combination (14 total: 7 servers x 2 clients).

Usage:
    ./extract.py [--docs-root PATH] [--output-dir PATH]

Defaults:
    --docs-root  /pay/src/pay-server/docs/content/integration-builder/custom-checkout/files
    --output-dir ./generated

Output structure:
    generated/
        {lang}-html/    # server configured for HTML client
        {lang}-react/   # server configured for React client
"""

import re
import os
import json
import shutil
import argparse
from pathlib import Path


# -----------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------

DOCS_ROOT_DEFAULT = "/pay/src/pay-server/docs/content/integration-builder/custom-checkout/files"

LANGUAGES = ["node", "python", "ruby", "php", "java", "go", "dotnet"]
CLIENTS   = ["html", "react"]

# Port allocation
HTML_BASE_PORT       = 4242   # node=4242, python=4243, ..., dotnet=4248
REACT_BACKEND_BASE   = 4249   # node=4249, python=4250, ..., dotnet=4255
REACT_DEV_BASE       = 3000   # node=3000, python=3001, ..., dotnet=3006

# Constants from docs/content/constants.yaml
CONSTANTS = {
    "stripe-node-sdk.version":   "21.0.1",
    "stripe-python-sdk.version": "15.0.0",
    "stripe-ruby-sdk.version":   "19.0.0",
    "stripe-php-sdk.version":    "20.0.0",
    "stripe-java-sdk.version":   "32.0.0",
    "stripe-go-sdk.version":     "85.0.0",
    "stripe-go-sdk-url.version": "85",
    "stripe-dotnet-sdk.version": "51.0.0",
    "stripe_js.latest_url":      "https://js.stripe.com/dahlia/stripe.js",
    "latestApiVersion":          "2025-08-04",
}

# Language-specific checkout mode values (used in place of {{CHECKOUT_MODE}})
CHECKOUT_MODE = {
    "node":   '"payment"',
    "python": "'payment'",
    "ruby":   "'payment'",
    "php":    "'payment'",
    "go":     'stripe.String("payment")',
    "java":   "SessionCreateParams.Mode.PAYMENT",
    "dotnet": '"payment"',
}

# Env var access for STRIPE_PRICE_ID
PRICE_ID_ENV = {
    "node":   "process.env.STRIPE_PRICE_ID",
    "python": "os.environ.get('STRIPE_PRICE_ID')",
    "ruby":   "ENV['STRIPE_PRICE_ID']",
    "php":    "getenv('STRIPE_PRICE_ID')",
    "go":     'os.Getenv("STRIPE_PRICE_ID")',
    "java":   'System.getenv("STRIPE_PRICE_ID")',
    "dotnet": 'Environment.GetEnvironmentVariable("STRIPE_PRICE_ID")',
}

# Env var access for STRIPE_SECRET_KEY
SECRET_KEY_ENV = {
    "node":   "process.env.STRIPE_SECRET_KEY",
    "python": "os.environ.get('STRIPE_SECRET_KEY')",
    "ruby":   "ENV['STRIPE_SECRET_KEY']",
    "php":    "getenv('STRIPE_SECRET_KEY')",
    "go":     'os.Getenv("STRIPE_SECRET_KEY")',
    "java":   'System.getenv("STRIPE_SECRET_KEY")',
    "dotnet": 'Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")',
}

# Env var access for STRIPE_PUBLISHABLE_KEY (used in React/HTML clients)
PUB_KEY_ENV = {
    "node":   "process.env.STRIPE_PUBLISHABLE_KEY",
    "python": "os.environ.get('STRIPE_PUBLISHABLE_KEY')",
    "ruby":   "ENV['STRIPE_PUBLISHABLE_KEY']",
    "php":    "getenv('STRIPE_PUBLISHABLE_KEY')",
    "go":     'os.Getenv("STRIPE_PUBLISHABLE_KEY")',
    "java":   'System.getenv("STRIPE_PUBLISHABLE_KEY")',
    "dotnet": 'Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY")',
}


# -----------------------------------------------------------------------
# Markdoc processor
# -----------------------------------------------------------------------

def evaluate_condition(attrs_str, settings):
    """Return True if a step with these attributes should be included."""
    when_m   = re.search(r'when=(\{[^}]+\})',   attrs_str)
    unless_m = re.search(r'unless=(\{[^}]+\})', attrs_str)

    if when_m:
        try:
            cond = json.loads(when_m.group(1))
        except json.JSONDecodeError:
            return True
        for key, value in cond.items():
            if key == "toggle":
                if value not in settings.get("toggle", set()):
                    return False
            elif settings.get(key) != value:
                return False

    if unless_m:
        try:
            cond = json.loads(unless_m.group(1))
        except json.JSONDecodeError:
            return True
        for key, value in cond.items():
            if key == "toggle":
                if value in settings.get("toggle", set()):
                    return False
            elif settings.get(key) == value:
                return False

    return True


def process_markdoc(code, settings):
    """
    Evaluate markdoc step conditionals, strip all {% %} tags, return clean code.
    """
    lines = code.split("\n")
    result = []
    skip_stack  = []
    in_comment  = False
    merchant_if   = False
    merchant_show = False

    for line in lines:
        stripped = line.strip()

        # comment blocks
        if stripped == "{% comment %}":
            in_comment = True
            continue
        if stripped == "{% /comment %}":
            in_comment = False
            continue
        if in_comment:
            continue

        # merchant login conditional - always take the "not logged in" branch
        if "{% if $merchant.isLoggedIn %}" in stripped:
            merchant_if   = True
            merchant_show = False
            continue
        if merchant_if and "{% else /%}" in stripped:
            merchant_show = True
            continue
        if merchant_if and "{% /if %}" in stripped:
            merchant_if   = False
            merchant_show = False
            continue
        if merchant_if and not merchant_show:
            continue

        # step open tag
        m_open = re.match(r"^\s*\{%\s*step\b(.*?)%\}\s*$", line)
        if m_open:
            attrs = m_open.group(1).strip()
            currently_skipping = any(skip_stack)
            if currently_skipping:
                skip_stack.append(True)
            else:
                skip_stack.append(not evaluate_condition(attrs, settings))
            continue

        # step close tag
        if re.match(r"^\s*\{%\s*/step\s*%\}\s*$", line):
            if skip_stack:
                skip_stack.pop()
            continue

        # skip content inside excluded blocks
        if skip_stack and any(skip_stack):
            continue

        result.append(line)

    return "\n".join(result)


def extract_code_block(text):
    """
    Pull out the content of a fenced code block, plus the declared filename.

    Handles both:
    - Files with a closing ``` fence (server files)
    - Files where the code runs to EOF without a closing fence (client files)
    """
    # Try with closing fence first (most server files)
    m = re.search(
        r"```[^\n]*?filename=\"([^\"]+)\"[^\n]*?\n(.*?)```",
        text,
        re.DOTALL,
    )
    if m:
        return m.group(2), m.group(1)

    # Try with closing fence but no filename
    m = re.search(r"```[^\n]*\n(.*?)```", text, re.DOTALL)
    if m:
        return m.group(1), None

    # Fallback: no closing fence - extract from opening fence line to EOF
    m = re.search(
        r"```[^\n]*?filename=\"([^\"]+)\"[^\n]*?\n(.*)",
        text,
        re.DOTALL,
    )
    if m:
        return m.group(2), m.group(1)

    # Last resort: any opening fence to EOF
    m = re.search(r"```[^\n]*\n(.*)", text, re.DOTALL)
    if m:
        return m.group(1), None

    return None, None


def apply_constants(text):
    """Replace {% $constant.values.X %} and {% $latestApiVersion %} with real values."""
    def replace_const(m):
        key = m.group(1)
        return CONSTANTS.get(key, m.group(0))

    text = re.sub(
        r"\{%\s*\$constant\.values\.([^\s%]+)\s*%\}",
        replace_const,
        text,
    )
    text = re.sub(
        r"\{%\s*\$latestApiVersion\s*%\}",
        CONSTANTS["latestApiVersion"],
        text,
    )
    return text


# Sentinel strings used to avoid double-quoting when substituting env vars
_SENTINEL_SK  = "__STRIPE_SECRET_KEY_EXPR__"
_SENTINEL_PK  = "__STRIPE_PUB_KEY_EXPR__"
_SENTINEL_PID = "__STRIPE_PRICE_ID_EXPR__"


def apply_language_vars(text, lang):
    """
    Replace Markdoc template placeholders with language-specific env-var expressions.

    Strategy: replace the ENTIRE quoted expression (e.g. "{% key /%}") with a
    sentinel, then replace the sentinel with the actual env-var accessor.  This
    removes the surrounding string-literal quotes so the result is valid code.
    """
    # --- Secret key ---
    # Match: "{% key type="secret" /%}" or '{% key type="secret" /%}'
    text = re.sub(
        r'''["']\{%\s*key\s+type="secret"\s*/\s*%\}["']''',
        _SENTINEL_SK,
        text,
    )
    # Fallback: unquoted (shouldn't normally appear, but be safe)
    text = re.sub(r'\{%\s*key\s+type="secret"\s*/\s*%\}', _SENTINEL_SK, text)
    text = text.replace(_SENTINEL_SK, SECRET_KEY_ENV[lang])

    # --- Publishable key ---
    text = re.sub(
        r'''["']\{%\s*key\s*/\s*%\}["']''',
        _SENTINEL_PK,
        text,
    )
    text = re.sub(r'\{%\s*key\s*/\s*%\}', _SENTINEL_PK, text)
    text = text.replace(_SENTINEL_PK, PUB_KEY_ENV[lang])

    # --- Price ID ---
    # Replace quoted {{PRICE_ID}} with sentinel first
    text = re.sub(r'"{{PRICE_ID}}"', _SENTINEL_PID, text)
    text = re.sub(r"'{{PRICE_ID}}'", _SENTINEL_PID, text)
    text = text.replace("{{PRICE_ID}}", _SENTINEL_PID)  # fallback (unquoted)
    text = text.replace(_SENTINEL_PID, PRICE_ID_ENV[lang])

    # --- Checkout mode ---
    text = text.replace("{{CHECKOUT_MODE}}", CHECKOUT_MODE[lang])

    return text


def strip_remaining_markdoc(text):
    """Remove any {% %} tags that weren't consumed by the step processor."""
    text = re.sub(r"\{%.*?%\}", "", text)
    return text


def apply_port_and_domain(code, lang, client):
    """
    Replace hardcoded port 4242 and domain URLs with the combination-specific values.
    Each combination gets unique ports so all 14 servers can coexist.
    """
    idx = LANGUAGES.index(lang)

    if client == "html":
        server_port = HTML_BASE_PORT + idx          # 4242-4248
        # HTML domain: the server itself hosts the static files
        old_domain_dq = '"http://localhost:4242"'
        old_domain_sq = "'http://localhost:4242'"
        new_domain_dq = f'"http://localhost:{server_port}"'
        new_domain_sq = f"'http://localhost:{server_port}'"
    else:
        server_port = REACT_BACKEND_BASE + idx      # 4249-4255
        react_port  = REACT_DEV_BASE + idx          # 3000-3006
        # React domain: React dev server handles the UI
        old_domain_dq = '"http://localhost:3000"'
        old_domain_sq = "'http://localhost:3000'"
        new_domain_dq = f'"http://localhost:{react_port}"'
        new_domain_sq = f"'http://localhost:{react_port}'"

    # Replace server listen port (standalone 4242)
    code = re.sub(r'\b4242\b', str(server_port), code)

    # Replace Go-style addr string and .NET UseUrls
    code = code.replace('"0.0.0.0:' + str(server_port) + '"',
                        f'"0.0.0.0:{server_port}"')
    code = code.replace(
        f'http://0.0.0.0:{server_port}',
        f'http://0.0.0.0:{server_port}',
    )

    # Replace YOUR_DOMAIN / domain strings
    code = code.replace(old_domain_dq, new_domain_dq)
    code = code.replace(old_domain_sq, new_domain_sq)

    return code


def process_file(md_path, settings, lang):
    """Read a markdown file and return (code, filename)."""
    raw = Path(md_path).read_text()
    code, filename = extract_code_block(raw)
    if code is None:
        return None, None
    code = process_markdoc(code, settings)
    code = apply_constants(code)
    code = apply_language_vars(code, lang)
    code = strip_remaining_markdoc(code)
    return code, filename


# -----------------------------------------------------------------------
# Language-specific dotenv additions
# -----------------------------------------------------------------------

def add_dotenv_node(code):
    if 'require("dotenv")' in code or "require('dotenv')" in code:
        return code
    return 'require("dotenv").config();\n' + code


def add_dotenv_python(code):
    if "load_dotenv" in code:
        return code
    block = "import os\nfrom dotenv import load_dotenv\nload_dotenv()\n\n"
    # Insert before the flask import line
    lines = code.split("\n")
    insert_at = next(
        (i for i, l in enumerate(lines) if l.startswith("from flask") or l.startswith("import flask")),
        0,
    )
    lines.insert(insert_at, block.rstrip())
    return "\n".join(lines)


def add_dotenv_ruby(code):
    if "Dotenv.load" in code:
        return code
    return "require 'dotenv'\nDotenv.load\n" + code


def add_go_os_import(code):
    """Ensure 'os' is imported in Go server code (needed for os.Getenv)."""
    if '"os"' in code:
        return code
    # Insert "os" before the stripe import line
    code = re.sub(
        r'("github\.com/stripe)',
        '"os"\n    \\1',
        code,
    )
    return code


# -----------------------------------------------------------------------
# HTML client files
# -----------------------------------------------------------------------

HTML_FILES = [
    ("web/html/app.md",           "public/checkout.html"),
    ("web/html/index.md",         "public/checkout.js"),
    ("web/html/css.md",           "public/checkout.css"),
    ("web/html/complete-html.md", "public/complete.html"),
    ("web/html/complete-js.md",   "public/complete.js"),
    ("web/html/complete-css.md",  "public/complete.css"),
]

REACT_FILES = [
    ("web/react/app.md",           "src/App.jsx"),
    ("web/react/app-css.md",       "src/App.css"),
    ("web/react/checkout-form.md", "src/CheckoutForm.jsx"),
    ("web/react/complete.md",      "src/Complete.jsx"),
    ("web/react/index-js.md",      "src/index.js"),
    ("web/react/index.md",         "public/index.html"),
]


# -----------------------------------------------------------------------
# Dependency files
# -----------------------------------------------------------------------

def write_node_package_json(out_dir):
    content = (
        '{\n'
        '  "name": "stripe-sample",\n'
        '  "version": "1.0.0",\n'
        '  "scripts": { "start": "node server.js" },\n'
        '  "dependencies": {\n'
        '    "dotenv": "^16.0.0",\n'
        '    "express": "^4.18.0",\n'
        f'    "stripe": "^{CONSTANTS["stripe-node-sdk.version"]}"\n'
        '  }\n'
        '}\n'
    )
    (out_dir / "package.json").write_text(content)


def write_python_requirements(out_dir):
    content = (
        f"Flask==3.1.2\n"
        f"python-dotenv==1.0.1\n"
        f"stripe=={CONSTANTS['stripe-python-sdk.version']}\n"
        f"Werkzeug==3.1.5\n"
        f"Jinja2==3.1.6\n"
        f"itsdangerous==2.2.0\n"
        f"click==8.3.1\n"
        f"MarkupSafe==3.0.3\n"
        f"certifi==2026.1.4\n"
    )
    (out_dir / "requirements.txt").write_text(content)


def write_ruby_gemfile(out_dir):
    content = (
        "source 'https://rubygems.org/'\n\n"
        "gem 'dotenv'\n"
        "gem 'sinatra'\n"
        "gem 'stripe'\n"
        "gem 'webrick'\n"
    )
    (out_dir / "Gemfile").write_text(content)


def write_php_composer(out_dir):
    content = (
        '{\n'
        '  "require": {\n'
        f'    "stripe/stripe-php": "^{CONSTANTS["stripe-php-sdk.version"]}"\n'
        '  }\n'
        '}\n'
    )
    (out_dir / "composer.json").write_text(content)


def write_go_mod(out_dir):
    v_url = CONSTANTS["stripe-go-sdk-url.version"]
    v_sdk = CONSTANTS["stripe-go-sdk.version"]
    content = (
        "module stripe.com/docs/payments\n\n"
        "go 1.21\n\n"
        f"require github.com/stripe/stripe-go/v{v_url} v{v_sdk}\n"
    )
    (out_dir / "go.mod").write_text(content)


def write_java_pom(out_dir):
    v = CONSTANTS["stripe-java-sdk.version"]
    content = f"""<project>
<modelVersion>4.0.0</modelVersion>
<groupId>com.stripe.sample</groupId>
<artifactId>stripe-payment</artifactId>
<version>1.0.0-SNAPSHOT</version>
<dependencies>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-simple</artifactId>
        <version>2.0.3</version>
    </dependency>
    <dependency>
        <groupId>com.sparkjava</groupId>
        <artifactId>spark-core</artifactId>
        <version>2.9.4</version>
    </dependency>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.9.1</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.20</version>
        <scope>provided</scope>
    </dependency>
    <dependency>
        <groupId>com.stripe</groupId>
        <artifactId>stripe-java</artifactId>
        <version>{v}</version>
    </dependency>
</dependencies>
<build>
    <finalName>sample</finalName>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.10.1</version>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
        <plugin>
            <artifactId>maven-assembly-plugin</artifactId>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals><goal>single</goal></goals>
                </execution>
            </executions>
            <configuration>
                <descriptorRefs>
                    <descriptorRef>jar-with-dependencies</descriptorRef>
                </descriptorRefs>
                <archive>
                    <manifest>
                        <mainClass>com.stripe.sample.Server</mainClass>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
</project>
"""
    (out_dir / "pom.xml").write_text(content)


def write_dotnet_csproj(out_dir):
    v = CONSTANTS["stripe-dotnet-sdk.version"]
    content = f"""<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <RootNamespace>StripeExample</RootNamespace>
    <RollForward>Major</RollForward>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc.NewtonsoftJson" Version="8.0.0" />
    <PackageReference Include="Stripe.net" Version="{v}" />
  </ItemGroup>
</Project>
"""
    (out_dir / "StripeExample.csproj").write_text(content)


def write_env_example(out_dir):
    content = (
        "STRIPE_SECRET_KEY=sk_test_...\n"
        "STRIPE_PUBLISHABLE_KEY=pk_test_...\n"
        "STRIPE_PRICE_ID=price_...\n"
    )
    (out_dir / ".env.example").write_text(content)


# -----------------------------------------------------------------------
# PHP secrets.php
# -----------------------------------------------------------------------

PHP_SECRETS = """\
<?php
// Load .env file for local development.
// If STRIPE_SECRET_KEY is already set in the environment, that takes precedence.
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile) && !getenv('STRIPE_SECRET_KEY')) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
        [$key, $val] = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($val, " \t\n\r\0\x0B\"'"));
    }
}
$stripeSecretKey      = getenv('STRIPE_SECRET_KEY');
$stripePublishableKey = getenv('STRIPE_PUBLISHABLE_KEY');
"""


# -----------------------------------------------------------------------
# React client package.json (per combination, different proxy port)
# -----------------------------------------------------------------------

def write_react_package_json(client_dir, backend_port):
    content = f"""\
{{
  "name": "stripe-sample-client",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:{backend_port}",
  "dependencies": {{
    "@stripe/react-stripe-js": "^6.0.0",
    "@stripe/stripe-js": "^9.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "react-scripts": "^5.0.1"
  }},
  "scripts": {{
    "start": "react-scripts start"
  }},
  "eslintConfig": {{ "extends": "react-app" }},
  "browserslist": {{
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }}
}}
"""
    (client_dir / "package.json").write_text(content)


# -----------------------------------------------------------------------
# Main extraction logic
# -----------------------------------------------------------------------

def make_settings(client):
    return {
        "client":                   client,
        "checkoutSessionPriceData": "disabled",  # use PRICE_ID (matches docs default)
        "mode":                     "payment",
        "toggle":                   set(),
    }


def extract_combination(docs_root, out_root, lang, client):
    """Extract one server+client combination into out_root/{lang}-{client}/."""
    settings  = make_settings(client)
    combo_dir = out_root / f"{lang}-{client}"
    combo_dir.mkdir(parents=True, exist_ok=True)

    # ---- server file ----
    server_src  = docs_root / "server" / f"{lang}.md"
    server_code, server_filename = process_file(server_src, settings, lang)
    if server_code is None:
        print(f"  WARN: could not extract server code from {server_src}")
        return

    # Apply port + domain substitution (bake combination-specific values)
    server_code = apply_port_and_domain(server_code, lang, client)

    # Language-specific dotenv / os-import additions
    if lang == "node":
        server_code = add_dotenv_node(server_code)
    elif lang == "python":
        server_code = add_dotenv_python(server_code)
    elif lang == "ruby":
        server_code = add_dotenv_ruby(server_code)
    elif lang == "go":
        server_code = add_go_os_import(server_code)

    # Determine output path for server file
    server_dest = server_filename or {
        "node":   "server.js",
        "python": "server.py",
        "ruby":   "server.rb",
        "php":    "public/create.php",
        "java":   "src/main/java/com/stripe/sample/Server.java",
        "go":     "server.go",
        "dotnet": "Server.cs",
    }[lang]

    dest_path = combo_dir / server_dest
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    dest_path.write_text(server_code.rstrip() + "\n")

    # ---- PHP extras ----
    if lang == "php":
        status_src  = docs_root / "server" / "php-retrieve-endpoint.md"
        status_code, _ = process_file(status_src, settings, "php")
        if status_code:
            (combo_dir / "public" / "status.php").write_text(
                status_code.rstrip() + "\n"
            )
        (combo_dir / "secrets.php").write_text(PHP_SECRETS)

    # ---- dependency / project files ----
    {
        "node":   lambda: write_node_package_json(combo_dir),
        "python": lambda: write_python_requirements(combo_dir),
        "ruby":   lambda: write_ruby_gemfile(combo_dir),
        "php":    lambda: write_php_composer(combo_dir),
        "java":   lambda: write_java_pom(combo_dir),
        "go":     lambda: write_go_mod(combo_dir),
        "dotnet": lambda: write_dotnet_csproj(combo_dir),
    }[lang]()

    write_env_example(combo_dir)

    # ---- client files ----
    if client == "html":
        # HTML static files go into public/ inside the server dir
        html_settings = make_settings("html")
        for rel_src, rel_dest in HTML_FILES:
            src_path = docs_root / rel_src
            code, _ = process_file(src_path, html_settings, lang)
            if code:
                code = apply_language_vars(code, lang)
                code = strip_remaining_markdoc(code)
                dest = combo_dir / rel_dest
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(code.rstrip() + "\n")

    else:
        # React client in client/ sub-directory
        idx          = LANGUAGES.index(lang)
        backend_port = REACT_BACKEND_BASE + idx
        client_dir   = combo_dir / "client"
        (client_dir / "src").mkdir(parents=True, exist_ok=True)
        (client_dir / "public").mkdir(parents=True, exist_ok=True)

        react_settings = make_settings("react")
        for rel_src, rel_dest in REACT_FILES:
            src_path = docs_root / rel_src
            code, _ = process_file(src_path, react_settings, lang)
            if code:
                code = apply_language_vars(code, lang)
                code = strip_remaining_markdoc(code)
                dest = client_dir / rel_dest
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(code.rstrip() + "\n")

        write_react_package_json(client_dir, backend_port)

        # React .env.example
        (client_dir / ".env.example").write_text(
            "REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...\n"
        )

    print(f"  generated/{lang}-{client}/")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--docs-root",  default=DOCS_ROOT_DEFAULT,
                        help="Path to custom-checkout/files docs directory")
    parser.add_argument("--output-dir", default="generated",
                        help="Directory to write generated code into")
    args = parser.parse_args()

    docs_root = Path(args.docs_root)
    out_root  = Path(args.output_dir)

    if not docs_root.exists():
        print(f"ERROR: docs root not found: {docs_root}")
        print("Run this script from a devbox where pay-server is checked out,")
        print(f"or pass --docs-root explicitly.")
        raise SystemExit(1)

    if out_root.exists():
        print(f"Removing existing output at {out_root}")
        shutil.rmtree(out_root)
    out_root.mkdir(parents=True)

    print(f"Extracting from: {docs_root}")
    print(f"Writing to:      {out_root.resolve()}")
    print()

    for lang in LANGUAGES:
        for client in CLIENTS:
            extract_combination(docs_root, out_root, lang, client)

    print()
    print(f"Done. Generated {len(LANGUAGES) * len(CLIENTS)} combinations.")
    print()
    print("Next steps:")
    print("  1. cp .env.example .env  && edit .env with your Stripe test keys")
    print("  2. ./run-all.sh")


if __name__ == "__main__":
    main()
