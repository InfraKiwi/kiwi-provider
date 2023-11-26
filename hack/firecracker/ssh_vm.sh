#!/usr/bin/env bash
set -euo pipefail
DIR="$(dirname -- "$( readlink -f -- "$0"; )")"

ssh -o StrictHostKeyChecking=no -i "$DIR/rootfs/assets/id_rsa" root@172.30.0.10