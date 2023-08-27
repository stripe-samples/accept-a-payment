#!/bin/bash -xe

source ../sample-ci/helpers.sh

export SAMPLE=${1}
export SERVER_TYPE=${2}
export STATIC_DIR=${3:-../../client/html}
export SERVER_IMAGE=${4}

if [ "$STATIC_DIR" = "../../client/html" ]
then
  export WORKING_DIR="${SAMPLE}/server/${SERVER_TYPE}"
else
  export SERVER_TYPE="node"
  export SERVER_IMAGE="node:lts"
  export WORKING_DIR="${SAMPLE}/client/$(basename "$STATIC_DIR")"
fi


CONFIG_DIR=$(echo "$WORKING_DIR" | tr / -)
mkdir -p "$CONFIG_DIR"
cat devcontainer-template.json | envsubst '$WORKING_DIR' > "$CONFIG_DIR/devcontainer.json"
cp docker-compose.override.yml "$CONFIG_DIR/docker-compose.override.yml"

pushd "$CONFIG_DIR"
ln -sF ../../sample-ci .
install_docker_compose_settings_for_integration ${SAMPLE} ${SERVER_TYPE} ${STATIC_DIR} ${SERVER_IMAGE}
rm -f sample-ci
ln -sF ../.env .
popd

