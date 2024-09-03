#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  composer install
  exec php -S 0.0.0.0:4242 index.php
else
  exec "$@"
fi
