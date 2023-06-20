#!/bin/bash -xe

source ../sample-ci/helpers.sh

export SAMPLE=${1}
export SERVER_TYPE=${2}
export STATIC_DIR=${3}
export SERVER_IMAGE=${4}
export WORKING_DIR="${SAMPLE}/server/${SERVER_TYPE}"

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


# sample="custom-payment-flow"
# for lang in $(cat .cli.json | server_langs_for_integration "$sample")
# do
#   WORKING_DIR="${sample}/server/${lang}"
#   CONFIG_DIR=$(echo "$WORKING_DIR" | tr / -)
#   mkdir -p "$CONFIG_DIR"
#   cat template.json | envsubst '$WORKING_DIR' > "$CONFIG_DIR/devcontainer.json"
#   cp docker-compose.override.yml "$CONFIG_DIR/docker-compose.override.yml"
# 
#   # TODO: generate docker-compose.yml
#   #   install_docker_compose_settings_for_integration
#   #     export SAMPLE=${1}
#   #     export SERVER_TYPE=${2}
#   #     export STATIC_DIR=${3}
#   #     export SERVER_IMAGE=${4}
#   #     export CLIENT_TYPE=$(basename "$STATIC_DIR")
# 
# done
