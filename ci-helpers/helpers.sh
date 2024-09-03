echo "Helloooooooo!!!"

retrieve_webhook_secret() {
  docker compose pull stripe > /dev/null 2>&1
  docker compose run -T --rm stripe -c '/bin/stripe listen --api-key $STRIPE_SECRET_KEY --print-secret'
}

install_docker_compose_settings() {
  touch .env;

  install_docker_compose_settings_for_integration "NA" "NA" "NA"

  docker compose run --entrypoint=/bin/sh runner -c true
  docker cp . $(docker compose ps -qa runner | head -1):/work/
  docker compose run --rm runner bundle install -j4
}

configure_docker_compose_for_integration() {
  [[ "$1" = "main" ]] && sample="." || sample="$1"
  server_type=${2}
  static_dir=${3}
  server_image=${4}

  echo "### Configuring the settings for the integration; sample: ${sample}, server_type: ${server_type}, static_dir: ${static_dir}, server_image: ${server_image}"

  install_docker_compose_settings_for_integration "$sample" "$server_type" "$static_dir" "$server_image"

  docker compose stop web || true
  docker compose build web

  # NOTE: On the CI, this function call is the only chance to copy the env file that contains proper values;
  #       maybe we should re-write ci.yml on each sample repository and remove this.
  docker cp .env $(docker compose ps -qa runner | head -1):/work/${sample}/server/${server_type}/ || true
}

install_docker_compose_settings_for_integration() {
  (
    export SAMPLE=${1}
    export SERVER_TYPE=${2}
    export STATIC_DIR=${3}
    export SERVER_IMAGE=${4}
    export CLIENT_TYPE=$(basename "$STATIC_DIR")

    if [[ -z "${SERVER_IMAGE}" ]]; then
      compose_file=docker-compose.yml
    else
      compose_file=docker-compose-v2.yml
    fi

    variables='${SAMPLE}${SERVER_TYPE}${STATIC_DIR}${CLIENT_TYPE}${SERVER_IMAGE}'
    cat sample-ci/docker/${compose_file} | envsubst "$variables" > docker-compose.yml
  )
}

wait_web_server() {
  docker compose exec -T -e TEST_URL="$1" runner bash -c 'curl -I --retry 30 --retry-delay 3 --retry-connrefused ${TEST_URL:-$SERVER_URL}'
}

server_langs_for_integration() {
  integration=${1:-main}
  jq -r ".integrations[] | select(.name==\"${integration}\") | .servers | .[]"
}

install_dummy_tests() {
  cp -pr sample-ci/spec .
  cp -p sample-ci/.rspec .
  cp -p sample-ci/Gemfile .
}

setup_dependencies() {
  __sudo apt update
  __sudo apt install gettext-base

  __sudo curl -o /usr/bin/jq -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64
  __sudo chmod +x /usr/bin/jq

  if [ -n "$ACT" ]; then
    # https://docs.docker.com/engine/install/debian/
    # https://docs.docker.com/compose/install/
    curl -fsSL https://get.docker.com | __sudo sh -
    __sudo curl -L "https://github.com/docker/compose/releases/download/1.28.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    __sudo chmod +x /usr/local/bin/docker-compose
  fi
}

__sudo() {
  if [ -x "$(which sudo)" ]; then
    sudo "$@"
  else
    "$@"
  fi
}
