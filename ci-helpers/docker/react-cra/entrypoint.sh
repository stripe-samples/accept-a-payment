#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  npm install
  exec npm start
else
  exec "$@"
fi
