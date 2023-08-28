#!/bin/bash -e

if [[ "$#" -eq "0" ]]; then
  service ssh restart || ( \
    apt update \
    && apt install -y openssh-server \
    && echo "PasswordAuthentication no" >> /etc/ssh/sshd_config \
    && echo "PubkeyAuthentication yes" >> /etc/ssh/sshd_config \
    && service ssh restart
  )

  mkdir -p ~/.ssh
  chmod 700 ~/.ssh

  bundle install -j4
  exec tail -f /dev/null
else
  exec "$@"
fi
