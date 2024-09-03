#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  bundle install -j4
  exec tail -f /dev/null
else
  exec "$@"
fi
