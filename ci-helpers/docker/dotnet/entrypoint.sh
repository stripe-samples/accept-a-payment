#!/bin/bash -e

case $(dotnet --version) in
  3.*)
    framework_flags="--framework netcoreapp3.1"
    ;;
  5.*)
    framework_flags="--framework net5.0"
    ;;
esac

if [[ "$#" -eq "0" ]]; then
  exec dotnet run --urls http://0.0.0.0:4242 $framework_flags
else
  exec "$@"
fi
