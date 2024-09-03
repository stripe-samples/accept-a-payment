#!/bin/bash -e

export FLASK_APP=server.py FLASK_ENV=${FLASK_ENV:-development}

if [[ "$#" -eq "0" ]]; then
  python -m pip install --upgrade pip
  pip install -r requirements.txt
  exec python3 -m flask run --port=4242 --host=0.0.0.0
else
  exec "$@"
fi
