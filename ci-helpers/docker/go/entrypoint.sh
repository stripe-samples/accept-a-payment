#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  exec go run server.go
else
  exec "$@"
fi
