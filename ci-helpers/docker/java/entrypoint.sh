#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  mvn package
  exec java -cp target/sample-jar-with-dependencies.jar com.stripe.sample.Server
else
  exec "$@"
fi
